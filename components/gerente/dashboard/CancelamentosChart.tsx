import { Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import type { Cancelamento } from '../../../hooks/useDashboardGerente';

const PALETA = ['#B30000', '#2563EB', '#D97706', '#16A34A', '#7C3AED', '#DB2777', '#0891B2', '#78716C'];

function formatarTipo(tipo: string) {
  return tipo
    .toLowerCase()
    .split('_')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

export function CancelamentosChart({ cancelamentos }: { cancelamentos: Cancelamento[] }) {
  const total = cancelamentos.reduce((soma, item) => soma + item.quantidade, 0);

  const dadosGrafico = cancelamentos.map((item, index) => ({
    value: item.quantidade,
    color: PALETA[index % PALETA.length],
    text: item.quantidade > 0 ? String(item.quantidade) : '',
  }));

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-xs font-semibold uppercase text-gray-400">Cancelamentos — mês atual</Text>

      {total === 0 ? (
        <Text className="mt-4 text-center text-sm text-gray-500">Nenhum cancelamento no período.</Text>
      ) : (
        <View className="mt-3 flex-row items-center">
          <PieChart data={dadosGrafico} radius={70} donut innerRadius={38} textColor="#FFFFFF" textSize={11} />

          <View className="ml-4 flex-1">
            {cancelamentos.map((item, index) => (
              <View key={item.tipo} className="mb-1.5 flex-row items-center gap-2">
                <View
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PALETA[index % PALETA.length] }}
                />
                <Text className="flex-1 text-xs text-gray-700" numberOfLines={1}>
                  {formatarTipo(item.tipo)}
                </Text>
                <Text className="text-xs font-semibold text-gray-900">{item.quantidade}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
