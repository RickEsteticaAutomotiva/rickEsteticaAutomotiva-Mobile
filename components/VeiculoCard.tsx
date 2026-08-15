import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { Veiculo } from '../types';

type VeiculoCardProps = {
  veiculo: Veiculo;
  selecionado?: boolean;
  onPress?: () => void;
  onEditar: () => void;
  onRemover: () => void;
};

export function VeiculoCard({
  veiculo,
  selecionado = false,
  onPress,
  onEditar,
  onRemover,
}: VeiculoCardProps) {
  const conteudo = (
    <View className="flex-1 flex-row items-center">
      <View
        className="h-[60px] w-[60px] items-center justify-center rounded-lg"
        style={{ backgroundColor: selecionado ? '#fee2e2' : '#f3f4f6' }}
      >
        <Ionicons name="car-outline" size={25} style={{ color: selecionado ? '#B30000' : '#a0a0a0' }} />
      </View>

      <View className="ml-4 flex-1">
        <View className="flex-row items-start justify-between">
          <Text className="text-xl font-semibold text-gray-900">
            {veiculo.marca} {veiculo.modelo}
          </Text>
        </View>

        <View className="mt-1 flex-row flex-wrap items-center gap-3">
          {veiculo.ano ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={20} color="#a0a0a0" />
              <Text className="text-base text-gray-900">{veiculo.ano}</Text>
            </View>
          ) : null}

          {veiculo.cor ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="color-palette-outline" size={20} color="#a0a0a0" />
              <Text className="text-base text-gray-900">{veiculo.cor}</Text>
            </View>
          ) : null}

          {veiculo.placa ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="card-outline" size={20} color="#a0a0a0" />
              <Text className="text-base text-gray-900">{veiculo.placa}</Text>
            </View>
          ) : null}
        </View>

        <View className="mt-2 flex-row items-center">
          <Pressable className="mr-2 flex-row items-start" onPress={onEditar}>
            <View className="flex-row items-center">
              <Ionicons name="pencil" size={20} color="#B30000" />
              <Text className="ml-2 text-red-900">Editar</Text>
            </View>
          </Pressable>

          <Pressable className="mr-2 flex-row items-start" onPress={onRemover}>
            <View className="flex-row items-center">
              <Ionicons name="trash-outline" size={20} color="#B30000" />
              <Text className="ml-2 text-red-900">Remover</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="mb-2 w-full flex-row items-center rounded-lg border p-2"
        style={{
          borderColor: selecionado ? '#B30000' : '#ffffff',
          backgroundColor: selecionado ? '#fee2e2ab' : '#ffffff',
        }}
      >
        {conteudo}
      </Pressable>
    );
  }

  return (
    <View
      className="mb-2 w-full flex-row items-center rounded-lg p-2"
      style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
    >
      {conteudo}
    </View>
  );
}
