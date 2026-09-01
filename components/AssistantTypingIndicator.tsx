import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export function AssistantTypingIndicator() {
  return (
    <View className="flex-row items-end mb-3 pr-12">
      <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: '#B30000' }}>
        <Ionicons name="sparkles" size={16} color="#FFFFFF" />
      </View>
      <View className="rounded-2xl rounded-bl-sm px-4 py-3 bg-white shadow">
        <Text className="text-base text-gray-400">digitando…</Text>
      </View>
    </View>
  );
}
