import { Text, View } from 'react-native';
import type { FluxoCaixa } from '../../../hooks/useDashboardGerente';
import { formatarPreco } from '../../../utils';

export function FluxoCaixaCard({ fluxo }: { fluxo: FluxoCaixa | null }) {
  if (!fluxo) {
    return null;
  }

  const percentualLucro = Math.min(100, Math.max(0, fluxo.percentualLucro));

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-xs font-semibold uppercase text-gray-400">Fluxo de caixa — últimos 30 dias</Text>
      <Text className="mt-1 text-2xl font-bold text-gray-900">{formatarPreco(fluxo.total)}</Text>

      <View className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <View className="h-full rounded-full" style={{ width: `${percentualLucro}%`, backgroundColor: '#B30000' }} />
      </View>

      <View className="mt-3 flex-row justify-between">
        <View>
          <Text className="text-xs text-gray-500">Lucro</Text>
          <Text className="text-sm font-semibold text-green-700">
            {formatarPreco(fluxo.lucro)} ({fluxo.percentualLucro.toFixed(0)}%)
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500">Custo</Text>
          <Text className="text-sm font-semibold text-red-700">
            {formatarPreco(fluxo.custo)} ({fluxo.percentualCusto.toFixed(0)}%)
          </Text>
        </View>
      </View>
    </View>
  );
}
