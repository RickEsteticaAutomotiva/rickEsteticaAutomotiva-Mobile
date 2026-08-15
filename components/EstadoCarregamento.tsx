import { ActivityIndicator, Text, View } from 'react-native';

type EstadoCarregamentoProps = {
  mensagem?: string;
  cor?: string;
};

export function EstadoCarregamento({
  mensagem = 'Carregando...',
  cor = '#B30000',
}: EstadoCarregamentoProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={cor} />
      <Text className="mt-3 text-base text-gray-700">{mensagem}</Text>
    </View>
  );
}
