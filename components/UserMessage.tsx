import { Text, View } from 'react-native';

type UserMessageProps = {
  texto: string;
};

export function UserMessage({ texto }: UserMessageProps) {
  return (
    <View className="flex-row justify-end mb-3 pl-12">
      <View
        className="rounded-2xl rounded-br-sm px-4 py-3 shadow"
        style={{ backgroundColor: '#B30000', maxWidth: '82%' }}
      >
        <Text className="text-base text-white">{texto}</Text>
      </View>
    </View>
  );
}
