import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type TelaEmBreveProps = {
  titulo: string;
  icone?: keyof typeof Ionicons.glyphMap;
};

export function TelaEmBreve({ titulo, icone = 'construct-outline' }: TelaEmBreveProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-8">
      <Ionicons name={icone} size={48} color="#B30000" />
      <Text className="mt-4 text-lg font-semibold text-gray-800 text-center">{titulo}</Text>
      <Text className="mt-2 text-sm text-gray-500 text-center">
        Esta tela está em construção e estará disponível em breve.
      </Text>
    </View>
  );
}
