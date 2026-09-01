import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { assistenteService } from '../services/AssistenteService';
import { servicosService } from '../services/ServicosService';
import { veiculoService } from '../services/VeiculoService';
import { ordemServicoService } from '../services/OrdemServicoService';
import { normalizarServicos, normalizarVeiculos } from '../utils/normalizacao';
import { formatarDataSimples } from '../utils';
import type { Servico, Veiculo } from '../types';

// Quantidade máxima de idas e volas de tool-calling por mensagem do usuário,
// para nunca deixar a conversa presa em loop caso o modelo insista em chamar
// ferramentas sem nunca responder em texto.
const MAX_ITERACOES_POR_MENSAGEM = 4;

type Autor = 'usuario' | 'ia';
type TipoMensagemUI = 'texto' | 'erro';

export type MensagemUI = {
  id: string;
  autor: Autor;
  texto: string;
  tipo: TipoMensagemUI;
};

export type ResumoAgendamentoPendente = {
  servicoId: number;
  servicoNome: string;
  precoServico: number;
  veiculoId: number;
  veiculoLabel: string;
  data: string;
  horario: string;
};

type ParteWire = {
  texto?: string;
  chamadaFuncao?: { nome: string; argumentos: Record<string, any> };
  respostaFuncao?: { nome: string; resposta: Record<string, any> };
};

type MensagemWire = {
  papel: 'usuario' | 'modelo';
  partes: ParteWire[];
};

type RespostaAssistenteWire = {
  texto: string | null;
  chamadasFuncao: Array<{ nome: string; argumentos: Record<string, any> }>;
};

let contadorId = 0;
function novoId() {
  contadorId += 1;
  return `msg-${Date.now()}-${contadorId}`;
}

// Estado e orquestração do assistente de agendamento por IA, de uso
// exclusivo do gerente — ele agenda serviços em nome dos clientes, nunca
// para si mesmo. As tools rodam aqui (client-side), chamando os mesmos
// services de gestão usados pelo restante da área do gerente (servicosService,
// veiculoService.buscarTodos, ordemServicoService.criarOrdemServicoGestao) —
// o backend só funciona como proxy autenticado para o modelo de IA (ver
// AssistenteService).
export function useAssistente() {
  const [mensagens, setMensagens] = useState<MensagemUI[]>(() => [
    {
      id: novoId(),
      autor: 'ia',
      texto:
        'Olá! Sou o assistente da Rick Estética Automotiva. Me diga qual cliente você quer atender (placa ou modelo do veículo), o serviço e o horário desejado para eu preparar o agendamento.',
      tipo: 'texto',
    },
  ]);
  const [enviando, setEnviando] = useState(false);
  const [resumoPendente, setResumoPendente] = useState<ResumoAgendamentoPendente | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [erroConfirmacao, setErroConfirmacao] = useState<string | null>(null);
  const [audioAtivo, setAudioAtivo] = useState(true);

  const historicoRef = useRef<MensagemWire[]>([]);
  const ultimosServicosRef = useRef<Servico[]>([]);
  const ultimosVeiculosRef = useRef<Veiculo[]>([]);
  const audioAtivoRef = useRef(audioAtivo);
  const ultimaMensagemFaladaRef = useRef<string | null>(null);
  const vozPreferidaRef = useRef<string | undefined>(undefined);

  audioAtivoRef.current = audioAtivo;

  // Escolhe uma vez, entre as vozes instaladas no aparelho, a de melhor
  // qualidade em pt-BR (fallback para qualquer pt-BR se nenhuma for
  // "Enhanced", e nenhuma voz específica — usa a default do sistema — se o
  // aparelho não tiver nenhuma voz pt-BR instalada).
  useEffect(() => {
    Speech.getAvailableVoicesAsync()
      .then((vozes) => {
        const vozesPtBr = vozes.filter((v) => v.language?.toLowerCase().startsWith('pt-br'));
        const melhorVoz =
          vozesPtBr.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ?? vozesPtBr[0];
        vozPreferidaRef.current = melhorVoz?.identifier;
      })
      .catch(() => {
        // Sem lista de vozes disponível: mantém o fallback do sistema.
      });
  }, []);

  const adicionarMensagemUI = useCallback(
    (autor: Autor, texto: string, tipo: TipoMensagemUI = 'texto') => {
      setMensagens((atual) => [...atual, { id: novoId(), autor, texto, tipo }]);
    },
    []
  );

  const executarFuncao = useCallback(
    async (nome: string, argumentos: Record<string, any>): Promise<Record<string, any>> => {
      try {
        switch (nome) {
          case 'buscarServicos': {
            const termo = String(argumentos?.termo ?? '');
            const resposta = await servicosService.pesquisar(termo);
            const servicos = normalizarServicos(resposta);
            ultimosServicosRef.current = servicos;
            return {
              resultados: servicos.map((s) => ({ id: Number(s.id), nome: s.nome, preco: Number(s.preco) })),
            };
          }

          case 'buscarVeiculos': {
            // Busca de gestão: cobre os veículos de qualquer cliente (por
            // placa, marca ou modelo) — o gerente agenda para o cliente, não
            // para si mesmo, então a busca nunca fica restrita a um usuário.
            const termo = String(argumentos?.termo ?? '');
            const resposta = await veiculoService.buscarTodos({ filtro: termo, pagina: 0, tamanho: 20 });
            const veiculos = normalizarVeiculos(resposta);
            ultimosVeiculosRef.current = veiculos;
            return {
              resultados: veiculos.map((v) => ({
                id: Number(v.id),
                marca: v.marca,
                modelo: v.modelo,
                placa: v.placa,
                cor: v.cor,
              })),
            };
          }

          case 'buscarHorariosDisponiveis': {
            const data = String(argumentos?.data ?? '');
            const servicosIds = Array.isArray(argumentos?.servicosIds)
              ? argumentos.servicosIds.map(Number)
              : [];
            const respostaHorarios = await ordemServicoService.buscarHorariosDisponiveis(data, servicosIds);
            const horarios = Array.isArray(respostaHorarios) ? respostaHorarios : [];
            return {
              resultados: horarios.map((h: { inicio: string; fim: string }) => ({
                inicio: h.inicio,
                fim: h.fim,
              })),
            };
          }

          case 'criarAgendamento': {
            // Não chama a API real aqui. Só monta o resumo (com dados já
            // conhecidos das buscas anteriores) e devolve ao modelo que a
            // proposta está aguardando confirmação do usuário na interface.
            const servicoId = Number(argumentos?.servicoId);
            const veiculoId = Number(argumentos?.veiculoId);
            const data = String(argumentos?.data ?? '');
            const horario = String(argumentos?.horario ?? '');
            const precoMinimo = Number(argumentos?.precoMinimo) || 0;

            const servico = ultimosServicosRef.current.find((s) => Number(s.id) === servicoId);
            const veiculo = ultimosVeiculosRef.current.find((v) => Number(v.id) === veiculoId);

            setResumoPendente({
              servicoId,
              servicoNome: servico?.nome ?? 'Serviço selecionado',
              precoServico: servico ? Number(servico.preco) : precoMinimo,
              veiculoId,
              veiculoLabel: veiculo ? `${veiculo.marca} ${veiculo.modelo} — ${veiculo.placa}` : 'Veículo selecionado',
              data,
              horario,
            });

            return { status: 'aguardando_confirmacao_usuario' };
          }

          default:
            return { erro: `Ferramenta desconhecida: ${nome}` };
        }
      } catch (error) {
        const mensagemErro = error instanceof Error ? error.message : 'Erro ao executar a ação.';
        return { erro: mensagemErro };
      }
    },
    []
  );

  const rodarConversa = useCallback(async () => {
    for (let iteracao = 0; iteracao < MAX_ITERACOES_POR_MENSAGEM; iteracao += 1) {
      const resposta = (await assistenteService.enviarMensagem(
        historicoRef.current
      )) as unknown as RespostaAssistenteWire;
      const texto: string | null = resposta?.texto ?? null;
      const chamadas: Array<{ nome: string; argumentos: Record<string, any> }> = resposta?.chamadasFuncao ?? [];

      const partesModelo: ParteWire[] = [];
      if (texto) {
        partesModelo.push({ texto });
        adicionarMensagemUI('ia', texto);
      }
      chamadas.forEach((chamada) => {
        partesModelo.push({ chamadaFuncao: { nome: chamada.nome, argumentos: chamada.argumentos ?? {} } });
      });

      if (partesModelo.length > 0) {
        historicoRef.current = [...historicoRef.current, { papel: 'modelo', partes: partesModelo }];
      }

      if (chamadas.length === 0) {
        if (!texto) {
          adicionarMensagemUI('ia', 'Não consegui entender, pode reformular?');
        }
        return;
      }

      const partesResposta: ParteWire[] = [];
      for (const chamada of chamadas) {
        // eslint-disable-next-line no-await-in-loop
        const resultado = await executarFuncao(chamada.nome, chamada.argumentos ?? {});
        partesResposta.push({ respostaFuncao: { nome: chamada.nome, resposta: resultado } });
      }

      historicoRef.current = [...historicoRef.current, { papel: 'usuario', partes: partesResposta }];
    }

    adicionarMensagemUI('ia', 'Ainda estou processando esse pedido — pode me dar mais detalhes ou tentar de novo?');
  }, [adicionarMensagemUI, executarFuncao]);

  const enviarMensagem = useCallback(
    async (texto: string) => {
      const textoLimpo = texto.trim();
      if (!textoLimpo || enviando) {
        return;
      }

      adicionarMensagemUI('usuario', textoLimpo);
      historicoRef.current = [...historicoRef.current, { papel: 'usuario', partes: [{ texto: textoLimpo }] }];

      setEnviando(true);
      try {
        await rodarConversa();
      } catch (error) {
        const mensagemErro =
          error instanceof Error
            ? error.message
            : 'Não consegui consultar os dados agora. Tente novamente em alguns instantes.';
        adicionarMensagemUI('ia', mensagemErro, 'erro');
      } finally {
        setEnviando(false);
      }
    },
    [enviando, adicionarMensagemUI, rodarConversa]
  );

  // Lê em voz alta cada nova mensagem da IA assim que ela entra na lista
  // (inclusive a saudação inicial). Guarda o id da última mensagem já falada
  // para não repetir a leitura em re-renders que não adicionam mensagem nova.
  useEffect(() => {
    const ultima = mensagens[mensagens.length - 1];
    if (!ultima || ultima.autor !== 'ia' || ultima.id === ultimaMensagemFaladaRef.current) {
      return;
    }
    ultimaMensagemFaladaRef.current = ultima.id;

    if (!audioAtivoRef.current) {
      return;
    }
    Speech.stop();
    Speech.speak(ultima.texto, { language: 'pt-BR', voice: vozPreferidaRef.current });
  }, [mensagens]);

  // Para a fala em andamento ao sair da tela do assistente.
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const alternarAudio = useCallback(() => {
    setAudioAtivo((atual) => {
      const novoValor = !atual;
      if (!novoValor) {
        Speech.stop();
      }
      return novoValor;
    });
  }, []);

  const cancelarResumo = useCallback(() => {
    setResumoPendente(null);
    setErroConfirmacao(null);
  }, []);

  const confirmarAgendamento = useCallback(async () => {
    if (!resumoPendente || confirmando) {
      return;
    }

    setConfirmando(true);
    setErroConfirmacao(null);

    try {
      const payload = {
        dataAgendamento: `${resumoPendente.data}T${resumoPendente.horario}:00`,
        servicos: [resumoPendente.servicoId],
        veiculo: resumoPendente.veiculoId,
        precoMinimo: resumoPendente.precoServico,
      };

      await ordemServicoService.criarOrdemServicoGestao(payload);

      adicionarMensagemUI(
        'ia',
        `✅ Agendamento realizado com sucesso!\n\n${resumoPendente.servicoNome} agendado para ${formatarDataSimples(
          resumoPendente.data
        )} às ${resumoPendente.horario}.\n\nVeículo do cliente: ${resumoPendente.veiculoLabel}`
      );
      setResumoPendente(null);
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : 'Não foi possível criar o agendamento. Tente novamente.';
      setErroConfirmacao(mensagemErro);
    } finally {
      setConfirmando(false);
    }
  }, [resumoPendente, confirmando, adicionarMensagemUI]);

  return {
    mensagens,
    enviando,
    enviarMensagem,
    resumoPendente,
    cancelarResumo,
    confirmarAgendamento,
    confirmando,
    erroConfirmacao,
    audioAtivo,
    alternarAudio,
  };
}
