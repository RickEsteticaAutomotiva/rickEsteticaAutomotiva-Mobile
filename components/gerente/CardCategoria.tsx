import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { Categoria } from '../../types';

type CardCategoriaProps = {
  categoria: Categoria;
  onEditar: () => void;
  onExcluir: () => void;
};

export function CardCategoria({ categoria, onEditar, onExcluir }: CardCategoriaProps) {
  return (
    <View className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="px-4 py-5" style={{ backgroundColor: '#B30000' }}>
        <Text className="text-lg font-semibold text-white">{categoria.nome}</Text>
      </View>

      <View className="flex-row border-t border-gray-100">
        <Pressable
          onPress={onEditar}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 active:opacity-70"
        >
          <Ionicons name="pencil-outline" size={16} color="#374151" />
          <Text className="text-sm font-semibold text-gray-700">Editar</Text>
        </Pressable>

        <View className="w-px bg-gray-100" />

        <Pressable
          onPress={onExcluir}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 active:opacity-70"
        >
          <Ionicons name="trash-outline" size={16} color="#B30000" />
          <Text className="text-sm font-semibold text-red-700">Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}
