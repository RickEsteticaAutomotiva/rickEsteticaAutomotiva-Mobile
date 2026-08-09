import { Text, View } from 'react-native';
import { Button } from './Button';

type InfoProductProps = {
    name: string;
    price: string;
};

export function InfoProduct({ name, price }: InfoProductProps) {
    return (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 rounded-t-2xl shadow-lg">
            <View className="flex-row justify-between items-center">
                <Text className="text-xl font-bold m-1">
                    {name}
                </Text>
            </View>

            <View className="bg-gray-200 my-2 rounded-lg p-2">
                <Text className="text-lg mb-3 m-1">
                    A partir de:
                </Text>
                <Text className="text-xl m-1 color-green-700 font-bold">
                    R$ {price}
                </Text>
            </View>

            <Button
                texto="Adicionar ao Carrinho"
                onClick={() => console.log('Botão clicado!')}
                className="bg-red-700"
                textClassName="text-white"
            />

            <Button
                texto="Agendar Serviço"
                onClick={() => console.log('Botão clicado!')}
                className="border-2 border-green-700"
                textClassName="text-green-700"
            />
        </View>
    );
}