import { Text, View } from 'react-native';
import type { CategoriaFaturamento } from '../../../hooks/useDashboardGerente';
import { formatarPreco } from '../../../utils';

export function FaturamentoServicosList({ categorias }: { categorias: CategoriaFaturamento[] }) {
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-xs font-semibold uppercase text-gray-400">Faturamento por serviço</Text>

      {categorias.length === 0 ? (
        <Text className="mt-4 text-center text-sm text-gray-500">Sem dados no período.</Text>
      ) : (
        categorias.map((categoria) => (
          <View key={categoria.categoria} className="mt-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-gray-900">{categoria.categoria}</Text>
              <Text className="text-sm font-semibold text-gray-900">{formatarPreco(categoria.total)}</Text>
            </View>

            {categoria.servicos.map((servico) => (
              <View key={servico.nome} className="mt-1 flex-row items-center justify-between pl-3">
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                  {servico.nome}
                </Text>
                <Text className="text-xs text-gray-500">{formatarPreco(servico.faturamento)}</Text>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
}
