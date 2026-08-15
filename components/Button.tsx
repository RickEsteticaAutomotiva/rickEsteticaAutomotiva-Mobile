import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonProps = {
  texto: string;
  onClick: () => void;
  className?: string;
  textClassName?: string;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({
  texto,
  onClick,
  className = "",
  textClassName = "",
  loading = false,
  disabled = false,
}: ButtonProps) {
  const desabilitado = disabled || loading;

  return (
    <Pressable
      className={`w-full h-14 py-1 px-8 rounded-lg items-center justify-center ${className} active:opacity-70 ${desabilitado ? 'opacity-60' : ''}`}
      onPress={onClick}
      disabled={desabilitado}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={`font-semibold text-lg ${textClassName}`}>
          {texto}
        </Text>
      )}
    </Pressable>
  );
}
