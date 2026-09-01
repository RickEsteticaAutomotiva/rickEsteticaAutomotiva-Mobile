import { Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { PontoFaturamento } from '../../../hooks/useDashboardGerente';
import { formatarPreco } from '../../../utils';

function rotuloData(dataIso: string) {
  const partes = dataIso.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}` : dataIso;
}

export function FaturamentoChart({ pontos }: { pontos: PontoFaturamento[] }) {
  const dadosGrafico = pontos.map((ponto) => ({
    value: ponto.faturamento,
    label: rotuloData(ponto.data),
  }));

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-xs font-semibold uppercase text-gray-400">Faturamento — últimos 30 dias</Text>

      {dadosGrafico.length === 0 ? (
        <Text className="mt-4 text-center text-sm text-gray-500">Sem dados no período.</Text>
      ) : (
        <View className="mt-3 items-center">
          <LineChart
            data={dadosGrafico}
            height={160}
            color="#B30000"
            thickness={2}
            startFillColor="#FCA5A5"
            endFillColor="#FFFFFF"
            startOpacity={0.4}
            endOpacity={0.05}
            areaChart
            hideDataPoints
            hideRules
            xAxisColor="#E5E7EB"
            yAxisColor="#E5E7EB"
            yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 9 }}
            noOfSections={3}
            spacing={Math.max(18, 280 / dadosGrafico.length)}
            initialSpacing={10}
            yAxisLabelWidth={40}
            formatYLabel={(label: string) => formatarPreco(Number(label), false)}
          />
        </View>
      )}
    </View>
  );
}
