import { Pressable, Text, View } from 'react-native';

type EstadoErroProps = {
  mensagem: string;
  acaoTexto?: string;
  onAcao?: () => void;
};

export function EstadoErro({ mensagem, acaoTexto, onAcao }: EstadoErroProps) {
  const temAcao = Boolean(acaoTexto && onAcao);

  return (
    <View className="flex-1 items-center justify-center bg-white px-5">
      <Text className={`text-base text-red-600 text-center ${temAcao ? 'mb-4' : ''}`}>
        {mensagem}
      </Text>

      {temAcao ? (
        <Pressable onPress={onAcao} className="rounded-lg bg-red-700 px-6 py-3">
          <Text className="text-base font-semibold text-white">{acaoTexto}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
