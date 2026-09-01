import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type CardMedioProps = {
  valor: string;
  label: string;
  icone?: keyof typeof Ionicons.glyphMap;
  tamanhoIcone?: number;
};

export function CardMedio({ valor, label, icone, tamanhoIcone = 20 }: CardMedioProps) {
  return (
    <View className="flex-1 justify-center rounded-2xl bg-white p-5 shadow-sm">
      <View className="items-center justify-center gap-2">
        <View className="flex-row items-center justify-center gap-2">
          {icone ? <Ionicons name={icone} size={tamanhoIcone} color="#374151" /> : null}
          <Text className="text-xl font-semibold text-gray-800 text-center">{valor}</Text>
        </View>
        <Text className="text-sm font-medium text-gray-500 text-center">{label}</Text>
      </View>
    </View>
  );
}
