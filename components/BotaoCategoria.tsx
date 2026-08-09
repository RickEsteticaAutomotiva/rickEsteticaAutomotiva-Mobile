import { Pressable, Text, Image, View } from 'react-native';

type ButtonProps = {
  categoria: string;
  imagem: string;
  index: number;
  onClick: () => void;
};

export function BotaoCategoria({
  categoria,
  imagem,
  index,
  onClick
}: ButtonProps) {
  return (
    <Pressable
        onPress={onClick}
        className="mb-3 rounded-xl border border-gray-200 h-20 w-[48.5%] flex-row items-center justify-between active:bg-gray-100"
        id={`botao-categoria-${index}`}
    >
        <View className="bg-gray-100 w-1/3 h-full">
            <Image source={{ uri: "https://www.setup.gg/wp-content/uploads/2024/06/sacy-featured-image-e1719282126561.jpg" }} className="w-full h-full rounded-l-lg" resizeMode="cover" />
        </View>
        <View className="w-2/3 h-full flex items-center justify-center">
            <Text className="text-base font-semibold text-gray-900">
                {categoria}
            </Text>
        </View>
    </Pressable>
  );
}