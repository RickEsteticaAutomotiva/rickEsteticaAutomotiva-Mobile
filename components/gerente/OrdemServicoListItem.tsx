import { Pressable, Text, View } from 'react-native';
import type { OrdemServico } from '../../types';
import { formatarDataHorarioCompleto, formatarPreco } from '../../utils';
import { StatusPill } from './StatusPill';

export function OrdemServicoListItem({ ordem, onPress }: { ordem: OrdemServico; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="mb-3 rounded-2xl bg-white p-4 shadow-sm active:opacity-80">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-900">
          OS #{ordem.id} {ordem.veiculo ? `— ${ordem.veiculo.modelo}` : ''}
        </Text>
        <StatusPill status={ordem.status} />
      </View>

      <Text className="mt-1 text-sm text-gray-600" numberOfLines={1}>
        {ordem.cliente?.nome || 'Cliente não informado'}
      </Text>

      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">{formatarDataHorarioCompleto(ordem.dataAgendamento ?? '')}</Text>
        <Text className="text-sm font-semibold text-green-700">{formatarPreco(ordem.precoTotal)}</Text>
      </View>
    </Pressable>
  );
}
