import { Pressable, Text, Image, View } from 'react-native';

type CarrinhoBottomProps = {

};

export function CarrinhoBottom({
  
}: CarrinhoBottomProps) {
  return (
    <View className="flex-row flex-wrap justify-between bg-white p-4 rounded-t-xl shadow-md w-full">
        <Text className="text-xl font-semibold text-gray-900 mb-3">
            Resumo do pedido
        </Text>

        <View className="flex-row justify-between w-full border-t border-gray-200 pt-3">
            <Text className="text-base font-semibold text-gray-900">
                Valor mínimo:
            </Text>
            <Text className="text-base font-semibold text-gray-900">
                R$ 0,00
            </Text>
        </View>

        <Pressable
            onPress={() => {}}
            className="mt-3 mb-8 rounded-lg py-2 px-4 w-full items-center"
            style={{ backgroundColor: '#B30000' }}
        >
            <Text className="text-base font-semibold text-white">
                Agendar serviço
            </Text>
        </Pressable>
    </View>
  );
}