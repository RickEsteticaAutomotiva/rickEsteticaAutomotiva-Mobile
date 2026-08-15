import { Pressable, Text, Image, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CategoriaChip } from './CategoriaChip';
import type { Categoria } from '../types';

type HeaderProps = {
  categorias?: Categoria[];
  categoriaSelecionadaId?: string | number | null;
  onSelecionarCategoria?: (categoriaId: string | number | null) => void;
  mostrarCategorias?: boolean;
  mostrarVoltar?: boolean;
  valorPesquisa?: string;
  onPressPesquisa?: () => void;
};

export function Header({
  categorias = [],
  categoriaSelecionadaId = null,
  onSelecionarCategoria = () => {},
  mostrarCategorias = true,
  mostrarVoltar = false,
  valorPesquisa = '',
  onPressPesquisa,
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
            {mostrarVoltar ? (
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={8}
                    className="mr-3 h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                    <Ionicons name="arrow-back" size={20} color="#ffffff" />
                </Pressable>
            ) : null}

            <Pressable
                onPress={onPressPesquisa ?? (() => router.push('/pesquisa'))}
                className={`flex-row mr-4 rounded-full py-2 px-3 items-start ${mostrarVoltar ? 'flex-1' : 'w-5/6'}`}
                style={{ backgroundColor: '#ffffff' }}
            >
                <View className="h-full pl-2 mr-2">
                  <Ionicons name="search-outline" size={20} color="#696b6e"/>
                </View>

                <Text
                    className={`flex-1 text-base ${valorPesquisa ? 'text-gray-900' : 'text-gray-500'}`}
                    numberOfLines={1}
                >
                    {valorPesquisa || 'Buscar serviços'}
                </Text>
            </Pressable>

          {!mostrarVoltar && (
            <Pressable
                onPress={() => {}}
                className="rounded-lg py-2 px-4 w-1/6 items-center justify-center"
            >
                <Ionicons name="notifications-outline" size={24} color="#ffffff" />
            </Pressable>
          )}
        </View>

        {/* Scroll horizontal que exibe a lista de categorias */}
        {mostrarCategorias && categorias.length > 0 && (
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