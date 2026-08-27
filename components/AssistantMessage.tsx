import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AssistantMessageProps = {
  texto: string;
  erro?: boolean;
};

export function AssistantMessage({ texto, erro = false }: AssistantMessageProps) {
  return (
    <View className="flex-row items-end mb-3 pr-12">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-2"
        style={{ backgroundColor: erro ? '#FEE2E2' : '#B30000' }}
      >
        <Ionicons name={erro ? 'alert' : 'sparkles'} size={16} color={erro ? '#B91C1C' : '#FFFFFF'} />
      </View>
      <View
        className={`rounded-2xl rounded-bl-sm px-4 py-3 ${erro ? 'bg-red-100' : 'bg-white'} shadow`}
        style={{ maxWidth: '82%' }}
      >
        <Text className={`text-base ${erro ? 'text-red-700' : 'text-gray-900'}`}>{texto}</Text>
      </View>
    </View>
  );
}
