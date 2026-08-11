import { Text, View } from 'react-native';
import { Button } from './Button';
import { router } from 'expo-router';
import { useCarrinho } from '../context/CarrinhoContext';
import { formatarPreco } from '../utils';

export function CarrinhoBottom() {
  const { quantidadeItens, total } = useCarrinho();

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
                {formatarPreco(total)}
            </Text>
        </View>

        <Button
            texto="Agendar Serviço"
            onClick={() => {router.push({
                      pathname: '/veiculo'
                      })}}
            className="mt-5 mb-4 bg-red-700 w-full"
            textClassName="text-white"
            disabled={quantidadeItens === 0}
        />
    </View>
  );
}