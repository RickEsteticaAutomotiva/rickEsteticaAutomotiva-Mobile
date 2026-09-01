import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import type { MetricaComVariacao } from '../../../hooks/useDashboardGerente';

type MetricCardProps = {
  titulo: string;
  metrica: MetricaComVariacao;
  formatarValor: (valor: number) => string;
};

export function MetricCard({ titulo, metrica, formatarValor }: MetricCardProps) {
  const positivo = metrica.variacaoPercentual >= 0;

  return (
    <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-xs font-semibold uppercase text-gray-400">{titulo}</Text>
      <Text className="mt-1 text-xl font-bold text-gray-900">{formatarValor(metrica.valor)}</Text>

      {metrica.variacaoPercentual !== 0 ? (
        <View className="mt-1 flex-row items-center gap-1">
          <Ionicons
            name={positivo ? 'trending-up' : 'trending-down'}
            size={14}
            color={positivo ? '#16A34A' : '#DC2626'}
          />
          <Text className="text-xs font-semibold" style={{ color: positivo ? '#16A34A' : '#DC2626' }}>
            {Math.abs(metrica.variacaoPercentual).toFixed(1)}%
          </Text>
        </View>
      ) : null}
    </View>
  );
}
