import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ordemServicoService } from '../services/OrdemServicoService';
import { veiculoService } from '../services/VeiculoService';
import { servicosService } from '../services/ServicosService';
import { normalizarOrdensServico, normalizarServicos, normalizarVeiculos } from '../utils/normalizacao';
import type { OrdemServico, Servico, Veiculo } from '../types';

export type Periodo = 'todos' | 'hoje' | 'semana' | 'mes';

function calcularIntervaloPeriodo(periodo: Periodo): { dataInicio?: string; dataFim?: string } {
  if (periodo === 'todos') return {};

  const hoje = new Date();
  const fim = hoje.toISOString().slice(0, 10);

  const inicio = new Date(hoje);
  if (periodo === 'hoje') {
    return { dataInicio: fim, dataFim: fim };
  }
  if (periodo === 'semana') {
    inicio.setDate(inicio.getDate() - 7);
  } else {
    inicio.setDate(inicio.getDate() - 30);
  }

  return { dataInicio: inicio.toISOString().slice(0, 10), dataFim: fim };
}

export type DadosCriarOrdemForm = {
  veiculoId: string | number | null;
  data: string;
  hora: string;
  servicosIds: Array<string | number>;
};

export function useOrdensServicoGerente() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [periodo, setPeriodo] = useState<Periodo>('todos');
  const [filtroStatus, setFiltroStatus] = useState<number | null>(null);
  const [filtroTexto, setFiltroTexto] = useState('');

  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemServico | null>(null);

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState<Servico[]>([]);
  const [modalCriarVisible, setModalCriarVisible] = useState(false);
  const [carregandoDadosCriar, setCarregandoDadosCriar] = useState(false);
  const [criando, setCriando] = useState(false);
  const [erroCriar, setErroCriar] = useState<string | null>(null);

  const carregarOrdens = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const { dataInicio, dataFim } = calcularIntervaloPeriodo(periodo);
      const resposta = await ordemServicoService.listarOrdensGestao({
        pagina,
        tamanho: 20,
        status: filtroStatus ?? undefined,
        filtro: filtroTexto.trim() || undefined,
        dataInicio,
        dataFim,
      });

      setOrdens(normalizarOrdensServico(resposta));
      const respostaObj = resposta as { totalPages?: number } | undefined;
      setTotalPaginas(Math.max(1, respostaObj?.totalPages ?? 1));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar as ordens de serviço.');
      setOrdens([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, periodo, filtroStatus, filtroTexto]);

  useFocusEffect(
    useCallback(() => {
      carregarOrdens();
    }, [carregarOrdens])
  );

  function aplicarFiltro(atualizacao: { periodo?: Periodo; status?: number | null; texto?: string }) {
    if (atualizacao.periodo !== undefined) setPeriodo(atualizacao.periodo);
    if (atualizacao.status !== undefined) setFiltroStatus(atualizacao.status);
    if (atualizacao.texto !== undefined) setFiltroTexto(atualizacao.texto);
    setPagina(0);
  }

  function handleOrdemAtualizada(ordemAtualizada: OrdemServico) {
    setOrdens((atual) => atual.map((ordem) => (ordem.id === ordemAtualizada.id ? ordemAtualizada : ordem)));
    setOrdemSelecionada(ordemAtualizada);
  }

  async function abrirModalCriar() {
    setModalCriarVisible(true);
    setErroCriar(null);
    setCarregandoDadosCriar(true);

    try {
      const [respostaVeiculos, respostaServicos] = await Promise.all([
        veiculoService.buscarTodos({ pagina: 0, tamanho: 50, ordenarPor: 'id', direcao: 'desc' }),
        servicosService.buscarTodos({ pagina: 0, tamanho: 50, ordenarPor: 'nome' }),
      ]);
      setVeiculos(normalizarVeiculos(respostaVeiculos));
      setServicosDisponiveis(normalizarServicos(respostaServicos));
    } catch (error) {
      setErroCriar(error instanceof Error ? error.message : 'Não foi possível carregar veículos e serviços.');
    } finally {
      setCarregandoDadosCriar(false);
    }
  }

  function fecharModalCriar() {
    if (criando) return;
    setModalCriarVisible(false);
  }

  async function criarOrdem(dados: DadosCriarOrdemForm) {
    if (criando) return;

    setCriando(true);
    setErroCriar(null);

    try {
      const [dia, mes, ano] = dados.data.split('/').map(Number);
      const [horaNum, minuto] = dados.hora.split(':').map(Number);
      const d = new Date(ano, (mes || 1) - 1, dia, horaNum, minuto, 0);
      const pad = (n: number) => String(n).padStart(2, '0');
      const dataAgendamento = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

      const servicosSelecionados = servicosDisponiveis.filter((servico) => dados.servicosIds.includes(servico.id));
      const precoMinimo = servicosSelecionados.reduce((soma, servico) => soma + (Number(servico.preco) || 0), 0);

      const criada = await ordemServicoService.criarOrdemServicoGestao({
        dataAgendamento,
        veiculo: dados.veiculoId,
        servicos: dados.servicosIds,
        precoMinimo,
      });

      setModalCriarVisible(false);
      setPagina(0);
      await carregarOrdens();

      const ordemNormalizada = normalizarOrdensServico({ content: [criada] })[0];
      if (ordemNormalizada) {
        setOrdemSelecionada(ordemNormalizada);
      }
    } catch (error) {
      setErroCriar(error instanceof Error ? error.message : 'Não foi possível criar a ordem de serviço.');
    } finally {
      setCriando(false);
    }
  }

  return {
    ordens,
    loading,
    erro,
    carregarOrdens,
    pagina,
    setPagina,
    totalPaginas,
    periodo,
    filtroStatus,
    filtroTexto,
    aplicarFiltro,
    ordemSelecionada,
    setOrdemSelecionada,
    handleOrdemAtualizada,
    veiculos,
    servicosDisponiveis,
    modalCriarVisible,
    carregandoDadosCriar,
    criando,
    erroCriar,
    abrirModalCriar,
    fecharModalCriar,
    criarOrdem,
  };
}
