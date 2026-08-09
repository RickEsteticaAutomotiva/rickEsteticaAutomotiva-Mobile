import { Pressable, Text } from 'react-native';

type ButtonProps = {
  texto: string;
  onClick: () => void;
  className?: string;
  textClassName?: string;
};

export function Button({
  texto,
  onClick,
  className = "",
  textClassName = ""
}: ButtonProps) {
  return (
    <Pressable
      className={`w-full h-14 py-1 px-8 rounded-lg items-center justify-center ${className} active:opacity-70`}
      onPress={onClick}
    >
      <Text className={`font-semibold text-lg ${textClassName}`}>
        {texto}
      </Text>
    </Pressable>
  );
}