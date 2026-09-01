import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type CardLargoProps = {
  texto: string;
  icone: keyof typeof Ionicons.glyphMap;
  tamanhoIcone?: number;
};

export function CardLargo({ texto, icone, tamanhoIcone = 22 }: CardLargoProps) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm flex-row items-center justify-center">
      <Ionicons name={icone} size={tamanhoIcone} color="#374151" />
      <Text className="ml-2 text-xl font-semibold text-gray-800 text-center">{texto}</Text>
    </View>
  );
}
