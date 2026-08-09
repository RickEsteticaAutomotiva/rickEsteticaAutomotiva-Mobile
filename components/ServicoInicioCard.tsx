import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { formatarPreco } from '../utils';

type ServicoProps = {
  servicoId: string | number;
  nome: string;
  descricao: string;
  preco: number | string;
  imagem?: string;
};

export function ServicoInicioCard({
  servicoId,
  nome,
  descricao,
  preco,
  imagem,
}: ServicoProps) {
  const precoFormatado = formatarPreco(preco);

  return (
    <Pressable
      className="mb-3 w-[48.5%] rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      id={`servico-card-${servicoId}`}
      onPress={() => {
        router.push({
          pathname: '/servicos/[servicoId]',
          params: {
            servicoId: String(servicoId),
          },
        });
      }}
    >
      <View className="mb-2 h-[150px] w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          source={require('../assets/servicos/Cristalizacao_de_Pintura.jpg')}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      <Text className="text-base font-semibold text-gray-900">
        {nome}
      </Text>

      <Text className="mt-1 text-sm text-gray-600">
        A partir de
      </Text>

      <Text className="text-xl font-medium text-green-700">
        {precoFormatado}
      </Text>
    </Pressable>
  );
}