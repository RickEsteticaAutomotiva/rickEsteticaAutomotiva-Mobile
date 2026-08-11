import { Pressable, Text, Image, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoriaChip } from './CategoriaChip';
import type { Categoria } from '../types';

type HeaderProps = {
  categorias: Categoria[];
  categoriaSelecionadaId: string | number | null;
  onSelecionarCategoria: (categoriaId: string | number | null) => void;
};

export function Header({
  categorias,
  categoriaSelecionadaId,
  onSelecionarCategoria,
}: HeaderProps) {
  return (
    <View className="flex direction-col justify-between bg-white p-4 pb-0 shadow-b-md w-full" style={{ backgroundColor: '#B30000' }}>
        {/* Logo */}
        <View className="w-full flex items-center mb-4">
            <Image
                source={require('../assets/rick_logo.png')}
                className="w-12 h-12"
                resizeMode="contain"
            />
        </View>

        {/* Barra de pesquisa e notificações */}
        <View className="flex-row items-center mb-4">
            <Pressable
                onPress={() => {}}
                className="flex-row mr-4 rounded-lg py-2 px-4 w-5/6 items-start justify-between"
                style={{ backgroundColor: '#ffffff' }}
            >
                <Text className="text-base font-semibold text-gray-500">
                    Buscar serviços
                </Text>

                <View className="h-full border-l border-gray-300 ml-2 pl-2">
                    <Ionicons name="search" size={24} color="#696b6e"/>
                </View>
            </Pressable>

            <Pressable
                onPress={() => {}}
                className="rounded-lg py-2 px-4 w-1/6 items-center justify-center"
            >
                <Ionicons name="notifications-outline" size={24} color="#ffffff" />
            </Pressable>
        </View>

        {/* Scroll horizontal que exibe a lista de categorias */}
        {categorias.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className=""
            contentContainerStyle={{ paddingRight: 8 }}
          >
          <CategoriaChip
            label="Todas"
            selecionada={categoriaSelecionadaId === null}
            onPress={() => onSelecionarCategoria(null)}
          />

          {categorias.map((categoria) => (
            <CategoriaChip
              key={String(categoria.id)}
              label={categoria.nome}
              selecionada={categoriaSelecionadaId === categoria.id}
              onPress={() => onSelecionarCategoria(categoria.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}