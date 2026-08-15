import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { categoriaService } from '../../services/CategoriaService';
import { servicosService } from '../../services/ServicosService';
import { BotaoCategoria } from '../../components/BotaoCategoria';
import { EstadoCarregamento } from '../../components/EstadoCarregamento';
import { normalizarCategorias, normalizarServicos } from '../../utils/normalizacao';
import { getImagemServico } from '../../constants/imagensServicos';
import type { Categoria } from '../../types';

export default function CategoriaScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagensCategorias, setImagensCategorias] = useState<
    Record<string, ImageSourcePropType>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarImagensCategorias = useCallback(async (categoriasParaCarregar: Categoria[]) => {
    const entradas = await Promise.all(
      categoriasParaCarregar.map(async (categoria) => {
        try {
          const servicosResponse = await servicosService.buscarPorCategoria(categoria.nome, {
            tamanho: 1,
          });
          const [servico] = normalizarServicos(servicosResponse);
          return [String(categoria.id), getImagemServico(servico?.nome)] as const;
        } catch {
          return [String(categoria.id), null] as const;
        }
      })
    );

    setImagensCategorias(
      Object.fromEntries(entradas.filter((entrada): entrada is [string, ImageSourcePropType] => entrada[1] !== null))
    );
  }, []);

  const carregarCategorias = useCallback(async () => {
    setErro(null);

    try {
      const response = await categoriaService.buscarTodas();
      const categoriasNormalizadas = normalizarCategorias(response);
      setCategorias(categoriasNormalizadas);
      carregarImagensCategorias(categoriasNormalizadas);
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
  }, [carregarImagensCategorias]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarCategorias();
    setRefreshing(false);
  }, [carregarCategorias]);

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando categorias..." cor="#111827" />;
  }

  return (
      <View className="flex-1 bg-white p-3">
        {erro ? <Text className="mt-4 text-sm text-red-600">{erro}</Text> : null}
  
        <FlatList
          data={categorias}
          numColumns={2}
          keyExtractor={(item, index) => String(item.id ?? `categoria-${index}`)}
          className="mt-4"
          contentContainerStyle={categorias.length === 0 ? { flexGrow: 1 } : null}
          columnWrapperStyle={
            categorias.length > 0 ? { justifyContent: 'space-between' } : undefined
          }

          renderItem={({ item, index }) => (
            <BotaoCategoria
              categoria={item.nome}
              imagem={imagensCategorias[String(item.id)]}
              index={index}
              onClick={() => {
                router.push({
                  pathname: '/categoria/[categoriaId]',
                  params: { categoriaId: String(item.id) },
                });
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
