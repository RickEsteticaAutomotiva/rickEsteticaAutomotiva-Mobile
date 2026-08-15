import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { EstadoErro } from '@/components/EstadoErro';
import { ServicoInicioCard } from '@/components/ServicoInicioCard';
import { useAuth } from '@/context/AuthContext';
import { useFavoritos } from '@/context/FavoritosContext';
import { favoritoService } from '@/services/FavoritoService';
import { normalizarFavoritosServicos } from '@/utils/normalizacao';
import type { FavoritoServico } from '@/types';

export default function Favoritos() {
  const { user } = useAuth();
  const { removerFavorito } = useFavoritos();

  const [favoritos, setFavoritos] = useState<FavoritoServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [removendoId, setRemovendoId] = useState<string | number | null>(null);

  const carregarFavoritos = useCallback(async () => {
    if (!user?.id) {
      setFavoritos([]);
      setLoading(false);
      return;
    }

    setErro(null);

    try {
      const response = await favoritoService.buscarFavoritosUsuario(user.id);
      setFavoritos(normalizarFavoritosServicos(response));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar seus favoritos.';
      setErro(mensagem);
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      carregarFavoritos();
    }, [carregarFavoritos])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarFavoritos();
    setRefreshing(false);
  }, [carregarFavoritos]);

  async function handleRemover(favorito: FavoritoServico) {
    if (removendoId !== null) {
      return;
    }

    setRemovendoId(favorito.idServico);

    try {
      // Reaproveita a mesma lógica de desfavoritar do FavoritosContext (DELETE
      // real + estado global consistente com o coração exibido em outras telas).
      await removerFavorito(favorito.idServico);
      setFavoritos((atual) => atual.filter((item) => item.idServico !== favorito.idServico));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível remover este favorito.';
      setErro(mensagem);
    } finally {
      setRemovendoId(null);
    }
  }

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando favoritos..." />;
  }

  if (erro && favoritos.length === 0) {
    return <EstadoErro mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregarFavoritos} />;
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={favoritos.length === 0 ? { flexGrow: 1 } : { padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {favoritos.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="heart-outline" size={40} color="#D1D5DB" />

          <Text className="mt-4 text-center text-base font-semibold text-gray-900">
            Você ainda não possui serviços favoritos.
          </Text>

          <Text className="mt-2 text-center text-sm text-gray-500">
            Encontre um serviço e favorite para acessá-lo aqui.
          </Text>

          <Button
            texto="Explorar serviços"
            onClick={() => router.push('/')}
            className="mt-5 bg-red-700"
            textClassName="text-white"
          />
        </View>
      ) : (
        favoritos.map((favorito) => (
          <View key={String(favorito.idFavorito)} className="relative mb-3">
            <ServicoInicioCard
              className="w-full"
              servicoId={favorito.idServico}
              nome={favorito.nome}
              descricao={favorito.descricao}
              preco={favorito.preco}
              imagem={favorito.imagem}
            />

            <Pressable
              onPress={() => handleRemover(favorito)}
              disabled={removendoId === favorito.idServico}
              hitSlop={8}
              className="absolute left-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white shadow"
            >
              <Ionicons name="heart" size={18} color="#B30000" />
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}
