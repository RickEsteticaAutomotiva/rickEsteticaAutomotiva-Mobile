import * as ImagePicker from 'expo-image-picker';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { importacaoAgendamentoService } from '../services/ImportacaoAgendamentoService';
import { ordemServicoService } from '../services/OrdemServicoService';
import { pessoaGestaoService } from '../services/PessoaGestaoService';
import { servicosService } from '../services/ServicosService';
import { veiculoService } from '../services/VeiculoService';
import type { DadosImportacaoAgendamento, OrdemServico, Pessoa, Servico, Veiculo } from '../types';
import { normalizarImportacaoAgendamento, normalizarOrdensServico, normalizarPessoas, normalizarServicos, normalizarVeiculos } from '../utils/normalizacao';

type ImagemCapturada = { uri: string; base64: string; mimeType: string };

type Selecao = {
  clienteId: string | number | null;
  veiculoId: string | number | null;
  servicosIds: (string | number)[];
  data: string;
  hora: string;
  valor: string;
  observacoes: string;
};

const SELECAO_VAZIA: Selecao = {
  clienteId: null,
  veiculoId: null,
  servicosIds: [],
  data: '',
  hora: '',
  valor: '',
  observacoes: '',
};

function dataIsoParaBr(dataIso: string | null): string {
  if (!dataIso) return '';
  const [ano, mes, dia] = dataIso.split('-');
  if (!ano || !mes || !dia) return '';
  return `${dia}/${mes}/${ano}`;
}

function horarioParaHhMm(horario: string | null): string {
  if (!horario) return '';
  return horario.slice(0, 5);
}

function useImportacaoAgendamentoState() {
  const [imagem, setImagem] = useState<ImagemCapturada | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erroProcessamento, setErroProcessamento] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosImportacaoAgendamento | null>(null);

  const [selecao, setSelecao] = useState<Selecao>(SELECAO_VAZIA);

  const [candidatosPessoaExtras, setCandidatosPessoaExtras] = useState<Pessoa[]>([]);
  const [candidatosVeiculoExtras, setCandidatosVeiculoExtras] = useState<Veiculo[]>([]);
  const [candidatosServicoExtras, setCandidatosServicoExtras] = useState<Servico[]>([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [buscandoVeiculo, setBuscandoVeiculo] = useState(false);
  const [buscandoServico, setBuscandoServico] = useState(false);

  const [criando, setCriando] = useState(false);
  const [erroCriar, setErroCriar] = useState<string | null>(null);
  const [ordemCriada, setOrdemCriada] = useState<OrdemServico | null>(null);

  function resetar() {
    setImagem(null);
    setProcessando(false);
    setErroProcessamento(null);
    setDados(null);
    setSelecao(SELECAO_VAZIA);
    setCandidatosPessoaExtras([]);
    setCandidatosVeiculoExtras([]);
    setCandidatosServicoExtras([]);
    setErroCriar(null);
    setOrdemCriada(null);
  }

  async function capturarImagem(origem: 'camera' | 'galeria'): Promise<boolean> {
    const permissao =
      origem === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      setErroProcessamento(
        origem === 'camera'
          ? 'É necessário conceder acesso à câmera para tirar a foto.'
          : 'É necessário conceder acesso às fotos para selecionar uma imagem.'
      );
      return false;
    }

    const opcoes: ImagePicker.ImagePickerOptions = {
      mediaTypes: 'images',
      base64: true,
      quality: 0.6,
      allowsEditing: false,
    };

    const resultado =
      origem === 'camera' ? await ImagePicker.launchCameraAsync(opcoes) : await ImagePicker.launchImageLibraryAsync(opcoes);

    if (resultado.canceled || !resultado.assets || resultado.assets.length === 0) {
      return false;
    }

    const asset = resultado.assets[0];
    if (!asset.base64) {
      setErroProcessamento('Não foi possível ler a imagem selecionada. Tente novamente.');
      return false;
    }

    resetar();
    setImagem({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType || 'image/jpeg' });
    return true;
  }

  async function processarImagem(): Promise<boolean> {
    if (!imagem || processando) return false;

    setProcessando(true);
    setErroProcessamento(null);

    try {
      const resposta = await importacaoAgendamentoService.extrair(imagem.base64, imagem.mimeType);
      const dadosNormalizados = normalizarImportacaoAgendamento(resposta);
      setDados(dadosNormalizados);
      setSelecao({
        ...SELECAO_VAZIA,
        data: dataIsoParaBr(dadosNormalizados.data.valor),
        hora: horarioParaHhMm(dadosNormalizados.horario.valor),
        valor: dadosNormalizados.valor.valor !== null ? String(dadosNormalizados.valor.valor) : '',
        observacoes: dadosNormalizados.observacoesLivres || '',
      });
      return true;
    } catch (error) {
      setErroProcessamento(error instanceof Error ? error.message : 'Não foi possível processar a imagem agora.');
      return false;
    } finally {
      setProcessando(false);
    }
  }

  async function buscarClientes(termo: string) {
    if (!termo.trim()) return;
    setBuscandoCliente(true);
    try {
      const resposta = await pessoaGestaoService.buscarPorFiltro(termo);
      setCandidatosPessoaExtras(normalizarPessoas(resposta));
    } catch {
      // busca manual é best-effort; falha silenciosa não deve travar a revisão
    } finally {
      setBuscandoCliente(false);
    }
  }

  async function buscarVeiculos(termo: string) {
    if (!termo.trim()) return;
    setBuscandoVeiculo(true);
    try {
      const resposta = await veiculoService.buscarTodos({ filtro: termo, pagina: 0, tamanho: 20 });
      setCandidatosVeiculoExtras(normalizarVeiculos(resposta));
    } catch {
      // idem
    } finally {
      setBuscandoVeiculo(false);
    }
  }

  async function buscarVeiculosDoCliente(clienteId: string | number) {
    setBuscandoVeiculo(true);
    try {
      const resposta = await veiculoService.buscarVeiculosPorUsuario(clienteId);
      setCandidatosVeiculoExtras(normalizarVeiculos(resposta));
    } catch {
      // idem
    } finally {
      setBuscandoVeiculo(false);
    }
  }

  async function buscarServicosCatalogo(termo: string) {
    if (!termo.trim()) return;
    setBuscandoServico(true);
    try {
      const resposta = await servicosService.pesquisar(termo);
      setCandidatosServicoExtras(normalizarServicos(resposta));
    } catch {
      // idem
    } finally {
      setBuscandoServico(false);
    }
  }

  function selecionarCliente(clienteId: string | number | null) {
    setSelecao((atual) => ({ ...atual, clienteId }));
  }

  function selecionarVeiculo(veiculoId: string | number | null) {
    setSelecao((atual) => ({ ...atual, veiculoId }));
  }

  function alternarServico(servicoId: string | number) {
    setSelecao((atual) => ({
      ...atual,
      servicosIds: atual.servicosIds.includes(servicoId)
        ? atual.servicosIds.filter((id) => id !== servicoId)
        : [...atual.servicosIds, servicoId],
    }));
  }

  function atualizarCampo(campo: 'data' | 'hora' | 'valor' | 'observacoes', texto: string) {
    setSelecao((atual) => ({ ...atual, [campo]: texto }));
  }

  function validar(): Record<string, string> {
    const erros: Record<string, string> = {};
    if (selecao.veiculoId === null) erros.veiculo = 'Selecione o veículo do agendamento';
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(selecao.data)) erros.data = 'Informe uma data válida (DD/MM/AAAA)';
    if (!/^\d{2}:\d{2}$/.test(selecao.hora)) erros.hora = 'Informe um horário válido (HH:MM)';
    if (selecao.servicosIds.length === 0) erros.servicos = 'Selecione ao menos um serviço do catálogo';
    return erros;
  }

  const todosServicosCandidatos: Servico[] = [...(dados?.candidatosServico ?? []), ...candidatosServicoExtras].filter(
    (servico, index, lista) => lista.findIndex((s) => s.id === servico.id) === index
  );

  async function confirmarCriacaoOS(): Promise<{ sucesso: boolean; erros?: Record<string, string> }> {
    const erros = validar();
    if (Object.keys(erros).length > 0) {
      return { sucesso: false, erros };
    }

    if (criando) return { sucesso: false };

    setCriando(true);
    setErroCriar(null);

    try {
      const [dia, mes, ano] = selecao.data.split('/').map(Number);
      const [horaNum, minuto] = selecao.hora.split(':').map(Number);
      const d = new Date(ano, (mes || 1) - 1, dia, horaNum, minuto, 0);
      const pad = (n: number) => String(n).padStart(2, '0');
      const dataAgendamento = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

      const servicosSelecionados = todosServicosCandidatos.filter((servico) => selecao.servicosIds.includes(servico.id));
      const somaServicos = servicosSelecionados.reduce((soma, servico) => soma + (Number(servico.preco) || 0), 0);
      const precoMinimo = selecao.valor.trim() ? Number(selecao.valor.replace(',', '.')) : somaServicos;

      const criada = await ordemServicoService.criarOrdemServicoGestao({
        dataAgendamento,
        veiculo: selecao.veiculoId,
        servicos: selecao.servicosIds,
        precoMinimo,
        observacoes: selecao.observacoes.trim() || undefined,
        origem: 'IMPORTACAO_IA',
      });

      const ordemNormalizada = normalizarOrdensServico({ content: [criada] })[0] ?? null;
      setOrdemCriada(ordemNormalizada);
      return { sucesso: true };
    } catch (error) {
      setErroCriar(error instanceof Error ? error.message : 'Não foi possível criar a ordem de serviço.');
      return { sucesso: false };
    } finally {
      setCriando(false);
    }
  }

  return {
    imagem,
    processando,
    erroProcessamento,
    dados,
    selecao,
    candidatosPessoaExtras,
    candidatosVeiculoExtras,
    candidatosServicoExtras: todosServicosCandidatos,
    buscandoCliente,
    buscandoVeiculo,
    buscandoServico,
    criando,
    erroCriar,
    ordemCriada,
    resetar,
    capturarImagem,
    processarImagem,
    buscarClientes,
    buscarVeiculos,
    buscarVeiculosDoCliente,
    buscarServicosCatalogo,
    selecionarCliente,
    selecionarVeiculo,
    alternarServico,
    atualizarCampo,
    confirmarCriacaoOS,
  };
}

export type ImportacaoAgendamentoState = ReturnType<typeof useImportacaoAgendamentoState>;

const ImportacaoAgendamentoContext = createContext<ImportacaoAgendamentoState | null>(null);

export function ImportacaoAgendamentoProvider({ children }: { children: ReactNode }) {
  const state = useImportacaoAgendamentoState();
  return <ImportacaoAgendamentoContext.Provider value={state}>{children}</ImportacaoAgendamentoContext.Provider>;
}

export function useImportacaoAgendamento(): ImportacaoAgendamentoState {
  const context = useContext(ImportacaoAgendamentoContext);
  if (!context) {
    throw new Error('useImportacaoAgendamento deve ser usado dentro de ImportacaoAgendamentoProvider');
  }
  return context;
}
