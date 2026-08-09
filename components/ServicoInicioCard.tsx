import { useNavigation } from '@react-navigation/native';
import { Image, Pressable, Text, View } from 'react-native';
import { ROUTES } from '../constants/Routes';
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
    imagem
}: ServicoProps) {
  const navigation = useNavigation<any>();
  const precoFormatado = formatarPreco(preco);

  return (
    <Pressable 
        className="mb-3 rounded-xl border border-gray-200 p-4 shadow-sm bg-white" 
        style={{ width: '48.5%' }} id={`servico-card-${servicoId}`}
        onPress={() => {
            navigation.navigate(ROUTES.SERVICO, { servicoId });
        }}
    >
        <View className="mb-2 w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: 150 }}>
            <Image
                source={require(`../../assets/servicos/Cristalizacao_de_Pintura.jpg`)}
                className="w-full h-full"
                resizeMode="cover"
            />
        </View>


        <Text className="text-base font-semibold text-gray-900">{nome}</Text>
        <Text className="mt-1 text-sm text-gray-600">A partir de</Text>
        <Text className="text-xl font-medium text-green-700">{precoFormatado}</Text>
    </Pressable>
  );
}