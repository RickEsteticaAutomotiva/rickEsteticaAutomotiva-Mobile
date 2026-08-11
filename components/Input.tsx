import { useState } from 'react';
import { KeyboardTypeOptions, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AutoCapitalize = 'none' | 'sentences' | 'words' | 'characters';

export type InputProps = {
  placeholder?: string;
  value: string;
  onChangeText: (texto: string) => void;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: AutoCapitalize;
  editable?: boolean;
  error?: string | null;
  multiline?: boolean;
  numberOfLines?: number;
};

export function Input({
  placeholder = 'Digite aqui...',
  value = '',
  onChangeText = () => {},
  secureTextEntry = false,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  error = null,
  multiline = false,
  numberOfLines = 4,
}: InputProps) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const ocultarTexto = isPassword ? !senhaVisivel : secureTextEntry;

  return (
    <View className="w-full">
      <View
        className={`w-full flex-row items-center bg-gray-200 rounded-lg px-4 ${
          multiline ? 'py-3' : 'h-12'
        } ${error ? 'border border-red-600' : ''}`}
      >
        <TextInput
          className="flex-1 text-base text-gray-800"
          style={multiline ? { minHeight: numberOfLines * 20, textAlignVertical: 'top' } : undefined}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={ocultarTexto}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
        />

        {isPassword ? (
          <Pressable onPress={() => setSenhaVisivel((atual) => !atual)} hitSlop={8}>
            <Ionicons
              name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#696b6e"
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
