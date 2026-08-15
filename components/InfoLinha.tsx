import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type InfoLinhaProps = {
  icone: keyof typeof Ionicons.glyphMap;
  label: string;
  valor?: string;
  ultimo?: boolean;
};

export function InfoLinha({ icone, label, valor, ultimo = false }: InfoLinhaProps) {
  return (
    <View
      className={`flex-row items-center px-4 py-4 ${ultimo ? '' : 'border-b border-gray-100'}`}
    >
      <Ionicons name={icone} size={20} color="#696b6e" />

      <View className="ml-3 flex-1">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="text-base text-gray-900">{valor || 'Não informado'}</Text>
      </View>
    </View>
  );
}
