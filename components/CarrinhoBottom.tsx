import { Pressable, Text, Image, View } from 'react-native';
import { Button } from './Button';

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

        <Button
            texto="Agendar Serviço"
            onClick={() => {}}
            className="mt-5 mb-4 bg-red-700 w-full"
            textClassName="text-white"
        />
    </View>
  );
}