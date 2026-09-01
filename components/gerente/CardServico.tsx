import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { getImagemServico } from '../../constants/imagensServicos';
import type { Categoria, Servico } from '../../types';
import { formatarPreco } from '../../utils';

type CardServicoProps = {
  servico: Servico;
  categoria?: Categoria;
  onEditar: () => void;
  onExcluir: () => void;
};

export function CardServico({ servico, categoria, onEditar, onExcluir }: CardServicoProps) {
  return (
    <View className="mb-3 flex-row overflow-hidden rounded-2xl bg-white shadow-sm">
      <Image source={getImagemServico(servico.nome)} className="h-full w-24" resizeMode="cover" />

      <View className="flex-1 p-3">
        {categoria ? (
          <Text className="text-xs font-semibold uppercase text-red-700">{categoria.nome}</Text>
        ) : null}

        <Text className="mt-0.5 text-base font-semibold text-gray-900" numberOfLines={1}>
          {servico.nome}
        </Text>

        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-green-700">{formatarPreco(servico.preco)}</Text>

          {servico.duracaoMinutos ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#696b6e" />
              <Text className="text-xs text-gray-500">{servico.duracaoMinutos} min</Text>
            </View>
          ) : null}
        </View>

        <View className="mt-2 flex-row gap-4">
          <Pressable onPress={onEditar} className="flex-row items-center gap-1 active:opacity-70">
            <Ionicons name="pencil-outline" size={14} color="#374151" />
            <Text className="text-xs font-semibold text-gray-700">Editar</Text>
          </Pressable>

          <Pressable onPress={onExcluir} className="flex-row items-center gap-1 active:opacity-70">
            <Ionicons name="trash-outline" size={14} color="#B30000" />
            <Text className="text-xs font-semibold text-red-700">Excluir</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
