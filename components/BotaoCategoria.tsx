import { Pressable, Text, Image, View } from 'react-native';
import { IMAGEM_PLACEHOLDER } from '../constants/imagens';

type BotaoCategoriaProps = {
  categoria: string;
  imagem?: string;
  index: number;
  onClick: () => void;
};

export function BotaoCategoria({
  categoria,
  imagem,
  index,
  onClick
}: BotaoCategoriaProps) {
  return (
    <Pressable
        onPress={onClick}
        className="mb-3 rounded-xl border border-gray-200 h-20 w-[48.5%] flex-row items-center justify-between active:bg-gray-100"
        id={`botao-categoria-${index}`}
    >
        <View className="bg-gray-100 w-1/3 h-full">
            <Image source={{ uri: imagem || IMAGEM_PLACEHOLDER }} className="w-full h-full rounded-l-lg" resizeMode="cover" />
        </View>
        <View className="w-2/3 h-full flex items-center justify-center">
            <Text className="text-base font-semibold text-gray-900">
                {categoria}
            </Text>
        </View>
    </Pressable>
  );
}