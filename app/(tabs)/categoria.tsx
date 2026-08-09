import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { categoriaService } from '../../services/CategoriaService';
import { BotaoCategoria } from '../../components/BotaoCategoria';

type Categoria = {
  id?: number | string;
  nome?: string;
  descricao?: string;
  imagem?: string;
};

function normalizarCategorias(response: unknown): Categoria[] {
  if (Array.isArray(response)) {
    return response as Categoria[];
  }

  if (response && typeof response === 'object') {
    const payload = response as Record<string, unknown>;
    const possiveisListas = ['data', 'content', 'categorias'];

    for (const chave of possiveisListas) {
      if (Array.isArray(payload[chave])) {
        return payload[chave] as Categoria[];
      }
    }
  }

  return [];
}

export default function Categoria() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarCategorias = useCallback(async () => {
    setErro(null);

    try {
      const response = await categoriaService.buscarTodas();
      const categoriasNormalizadas = normalizarCategorias(response);
      setCategorias(categoriasNormalizadas);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as categorias.';
      setErro(mensagem);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarCategorias();
    setRefreshing(false);
  }, [carregarCategorias]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#111827" />
        <Text className="mt-3 text-base text-gray-700">
          Carregando categorias...
        </Text>
      </View>
    );
  }

  return (
      <View className="flex-1 bg-white p-5">
        {erro ? <Text className="mt-4 text-sm text-red-600">{erro}</Text> : null}
  
        <FlatList
          data={categorias}
          numColumns={2}
          keyExtractor={(item, index) =>
            item.id ? String(item.id) : `categoria-${index}`
          }
          className="mt-4"
          contentContainerStyle={categorias.length === 0 ? { flexGrow: 1 } : null}
          columnWrapperStyle={
            categorias.length > 0 ? { justifyContent: 'space-between' } : undefined
          }

          renderItem={({ item, index }) => (
            <BotaoCategoria
              categoria={item.nome!}
              imagem={''}
              index={index}
              onClick={() => {
                console.log('Categoria selecionada:', item);
              }}
            />
          )}

          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-base text-gray-500">
                Nenhuma categoria encontrada.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    );
}
