import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type ConfiguracaoItemProps = {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  subtitulo?: string;
  onPress: () => void;
};

export function ConfiguracaoItem({ icone, titulo, subtitulo, onPress }: ConfiguracaoItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center justify-between rounded-lg bg-white px-4 py-3 active:opacity-70"
    >
      <View className="flex-1 flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name={icone} size={20} color="#B30000" />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-base text-gray-900">{titulo}</Text>
          {subtitulo ? <Text className="mt-0.5 text-xs text-gray-500">{subtitulo}</Text> : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#696b6e" />
    </Pressable>
  );
}
