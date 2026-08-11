import { Pressable, Text, View } from 'react-native';

type CategoriaChipProps = {
  label: string;
  selecionada: boolean;
  onPress: () => void;
};

export function CategoriaChip({ label, selecionada, onPress }: CategoriaChipProps) {
  return (
    <Pressable onPress={onPress} className="mr-2 px-4 pt-2">
      <Text
        className="mb-2"
        style={{
          fontWeight: selecionada ? 'bold' : 'normal',
          color: selecionada ? '#FFFFFF' : '#000000',
        }}
      >
        {label}
      </Text>

      <View
        className="rounded-t-full h-2 w-full bg-white"
        style={{ display: selecionada ? 'flex' : 'none' }}
      />
    </Pressable>
  );
}
