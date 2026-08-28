import { Destaque } from '@/components/Destaque';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { Header } from '@/components/Header';
import { ServicoInicioCard } from "@/components/ServicoInicioCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { categoriaService } from "../../services/CategoriaService";
import { servicosService } from "../../services/ServicosService";
import { normalizarCategorias, normalizarServicos } from "../../utils/normalizacao";
import type { Categoria, Servico } from "../../types";

export default function Home() {
  const { categoriaId: categoriaIdParam } = useLocalSearchParams<{ categoriaId?: string }>();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<
    string | number | null
  >(categoriaIdParam ?? null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const categoriaSelecionada = useMemo(
    () => categorias.find((categoria) => categoria.id === categoriaSelecionadaId) || null,
    [categoriaSelecionadaId, categorias]
  );

  const carregarCategorias = useCallback(async () => {
    const response = await categoriaService.buscarTodas();
    const lista = normalizarCategorias(response);
    setCategorias(lista);
    return lista;
  }, []);

  const carregarServicos = useCallback(async (categoriaNome?: string) => {
    const response = categoriaNome
      ? await servicosService.buscarPorCategoria(categoriaNome)
      : await servicosService.buscarTodos();

    setServicos(normalizarServicos(response));
  }, []);

  const carregarDadosIniciais = useCallback(async () => {
    setErro(null);

    try {
      const categoriasCarregadas = await carregarCategorias();
      const categoriaInicial = categoriaIdParam
        ? categoriasCarregadas.find((item) => String(item.id) === categoriaIdParam)
        : undefined;

      setCategoriaSelecionadaId(categoriaInicial?.id ?? null);
      await carregarServicos(categoriaInicial?.nome);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar a home.';
      setErro(mensagem);
      setCategorias([]);
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, [carregarCategorias, carregarServicos, categoriaIdParam]);

  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  const selecionarCategoria = useCallback(
    async (categoriaId: string | number | null) => {
      setCategoriaSelecionadaId(categoriaId);
      setErro(null);

      try {
        const categoria = categorias.find((item) => item.id === categoriaId);
        await carregarServicos(categoria?.nome);
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : 'Não foi possível filtrar os serviços por categoria.';
        setErro(mensagem);
        setServicos([]);
      }
    },
    [carregarServicos, categorias]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCategoriaSelecionadaId(null);
    await carregarDadosIniciais();
    setRefreshing(false);
  }, [carregarDadosIniciais]);

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando home..." />;
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: '#B30000' }}>
      <Header
        categorias={categorias}
        categoriaSelecionadaId={categoriaSelecionadaId}
        onSelecionarCategoria={selecionarCategoria}
      />
      <View className="flex-1 w-full bg-gray-200">
        {erro ? <Text className="mb-4 text-sm text-red-600">{erro}</Text> : null}

        <ScrollView
          className="flex-1 w-full pt-5"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Destaque />

          <View className="w-full bg-white px-5 mt-5 rounded-tl-3xl rounded-tr-3xl pt-5 pb-5">
            <Text className="text-2xl font-bold text-gray-900">
              {categoriaSelecionada ? categoriaSelecionada.nome : 'Todos os serviços'}
            </Text>

            {servicos.length === 0 ? (
              <View className="py-8">
                <Text className="text-base text-gray-500">
                  Nenhum serviço encontrado para esta categoria.
                </Text>
              </View>
            ) : (
              <View className="mt-4 flex-row flex-wrap justify-between">
                {servicos.map((servico) => {
                  return (
                    <ServicoInicioCard
                      key={String(servico.id)}
                      servicoId={servico.id}
                      nome={servico.nome}
                      descricao={servico.descricao}
                      preco={servico.preco}
                      imagem={servico.imagem}
                    />
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
