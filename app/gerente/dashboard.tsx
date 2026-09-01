import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '@/components/Alerta';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { CancelamentosChart } from '@/components/gerente/dashboard/CancelamentosChart';
import { FaturamentoChart } from '@/components/gerente/dashboard/FaturamentoChart';
import { FaturamentoServicosList } from '@/components/gerente/dashboard/FaturamentoServicosList';
import { FluxoCaixaCard } from '@/components/gerente/dashboard/FluxoCaixaCard';
import { MetricCard } from '@/components/gerente/dashboard/MetricCard';
import { useDashboardGerente } from '../../hooks/useDashboardGerente';
import { formatarPreco } from '../../utils';

export default function DashboardGerente() {
  const {
    faturamento,
    totalOrdens,
    servicosConcluidos,
    ticketMedio,
    faturamentoPeriodo,
    faturamentoPorServico,
    fluxoCaixa,
    cancelamentos,
    loading,
    erro,
    carregar,
  } = useDashboardGerente();

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando dashboard..." />;
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} />}
      >
        {erro ? <Alerta tipo="erro" mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregar} /> : null}

        <View className="flex-row gap-3">
          <MetricCard titulo="Faturamento do mês" metrica={faturamento} formatarValor={(v) => formatarPreco(v)} />
          <MetricCard titulo="Ordens do mês" metrica={totalOrdens} formatarValor={(v) => String(v)} />
        </View>

        <View className="mt-3 flex-row gap-3">
          <MetricCard titulo="Serviços concluídos" metrica={servicosConcluidos} formatarValor={(v) => String(v)} />
          <MetricCard titulo="Ticket médio" metrica={ticketMedio} formatarValor={(v) => formatarPreco(v)} />
        </View>

        <View className="mt-3">
          <FaturamentoChart pontos={faturamentoPeriodo} />
        </View>

        <View className="mt-3">
          <FluxoCaixaCard fluxo={fluxoCaixa} />
        </View>

        <View className="mt-3">
          <FaturamentoServicosList categorias={faturamentoPorServico} />
        </View>

        <View className="my-3">
          <CancelamentosChart cancelamentos={cancelamentos} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
