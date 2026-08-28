import { Pressable, Text, View } from 'react-native';
import type { OrdemServico } from '../../types';
import { formatarHorario, formatarPreco } from '../../utils';
import { StatusPill } from './StatusPill';

export function CardAgendamentoHoje({ ordem, onPress }: { ordem: OrdemServico; onPress: () => void }) {
  const nomeServicos =
    ordem.servicos.length === 0
      ? 'Sem serviços'
      : ordem.servicos.length === 1
        ? ordem.servicos[0].nome
        : `${ordem.servicos.length} serviços`;

  return (
    <Pressable onPress={onPress} className="mb-3 rounded-2xl bg-white p-4 shadow-sm active:opacity-80">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-900">{formatarHorario(ordem.dataAgendamento ?? '')}</Text>
        <StatusPill status={ordem.status} />
      </View>

      <Text className="mt-1 text-sm text-gray-700" numberOfLines={1}>
        {nomeServicos}
      </Text>

      <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
        {ordem.cliente?.nome || 'Cliente não informado'}
        {ordem.veiculo ? ` — ${ordem.veiculo.marca} ${ordem.veiculo.modelo}` : ''}
      </Text>

      <Text className="mt-1 text-sm font-semibold text-green-700">{formatarPreco(ordem.precoTotal)}</Text>
    </Pressable>
  );
}
