import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { dashboardService } from '../services/DashboardService';

export type MetricaComVariacao = {
  valor: number;
  variacaoPercentual: number;
};

export type PontoFaturamento = { data: string; faturamento: number };
export type ServicoFaturamento = { nome: string; faturamento: number };
export type CategoriaFaturamento = { categoria: string; total: number; servicos: ServicoFaturamento[] };
export type FluxoCaixa = { total: number; lucro: number; custo: number; percentualLucro: number; percentualCusto: number };
export type Cancelamento = { tipo: string; quantidade: number };

type EstadoDashboard = {
  faturamento: MetricaComVariacao;
  totalOrdens: MetricaComVariacao;
  servicosConcluidos: MetricaComVariacao;
  ticketMedio: MetricaComVariacao;
  faturamentoPeriodo: PontoFaturamento[];
  faturamentoPorServico: CategoriaFaturamento[];
  fluxoCaixa: FluxoCaixa | null;
  cancelamentos: Cancelamento[];
};

const ESTADO_VAZIO: EstadoDashboard = {
  faturamento: { valor: 0, variacaoPercentual: 0 },
  totalOrdens: { valor: 0, variacaoPercentual: 0 },
  servicosConcluidos: { valor: 0, variacaoPercentual: 0 },
  ticketMedio: { valor: 0, variacaoPercentual: 0 },
  faturamentoPeriodo: [],
  faturamentoPorServico: [],
  fluxoCaixa: null,
  cancelamentos: [],
};

export function useDashboardGerente() {
  const [dados, setDados] = useState<EstadoDashboard>(ESTADO_VAZIO);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const [faturamento, totalOrdens, servicosConcluidos, ticketMedio, faturamentoPeriodo, faturamentoServicos, fluxoCaixa, cancelamentos] =
        (await Promise.all([
          dashboardService.faturamento(),
          dashboardService.totalOrdens(),
          dashboardService.servicosConcluidos(),
          dashboardService.ticketMedio(),
          dashboardService.faturamentoPeriodo(),
          dashboardService.faturamentoPorServico(),
          dashboardService.fluxoCaixa(),
          dashboardService.buscarCancelamentos(),
        ])) as any[];

      setDados({
        faturamento: {
          valor: Number(faturamento?.faturamentoAtual || 0),
          variacaoPercentual: Number(faturamento?.variacaoPercentual || 0),
        },
        totalOrdens: {
          valor: Number(totalOrdens?.totalOrdens || 0),
          variacaoPercentual: Number(totalOrdens?.variacaoPercentual || 0),
        },
        servicosConcluidos: {
          valor: Number(servicosConcluidos?.totalOrdensConcluidas || 0),
          variacaoPercentual: Number(servicosConcluidos?.variacaoPercentual || 0),
        },
        ticketMedio: {
          valor: Number(ticketMedio?.totalTicketMedioMesAtual || 0),
          variacaoPercentual: Number(ticketMedio?.variacaoPercentual || 0),
        },
        faturamentoPeriodo: (Array.isArray(faturamentoPeriodo) ? faturamentoPeriodo : [])
          .map((ponto: { data?: string; faturamentoDiario?: number }) => ({
            data: String(ponto?.data || ''),
            faturamento: Number(ponto?.faturamentoDiario || 0),
          }))
          .sort((a, b) => a.data.localeCompare(b.data)),
        faturamentoPorServico: (Array.isArray(faturamentoServicos) ? faturamentoServicos : []).map(
          (categoria: { categoria?: string; servicos?: { servico?: string; faturamento?: number }[] }) => {
            const servicos = (categoria?.servicos || []).map((servico) => ({
              nome: String(servico?.servico || ''),
              faturamento: Number(servico?.faturamento || 0),
            }));
            return {
              categoria: String(categoria?.categoria || 'Sem categoria'),
              total: servicos.reduce((soma, servico) => soma + servico.faturamento, 0),
              servicos,
            };
          }
        ),
        fluxoCaixa: fluxoCaixa
          ? {
              total: Number(fluxoCaixa.total || 0),
              lucro: Number(fluxoCaixa.lucro || 0),
              custo: Number(fluxoCaixa.custo || 0),
              percentualLucro: Number(fluxoCaixa.percentualLucro || 0),
              percentualCusto: Number(fluxoCaixa.percentualCusto || 0),
            }
          : null,
        cancelamentos: (Array.isArray(cancelamentos) ? cancelamentos : []).map(
          (item: { tipo?: string; quantidade?: number }) => ({
            tipo: String(item?.tipo || 'Outro'),
            quantidade: Number(item?.quantidade || 0),
          })
        ),
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  return { ...dados, loading, erro, carregar };
}
