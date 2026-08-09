import { Destaque } from '@/components/Destaque';
import { Header } from '@/components/Header';
import { ServicoInicioCard } from "@/components/ServicoInicioCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { categoriaService } from "../../services/CategoriaService";
import { servicosService } from "../../services/ServicosService";

type Categoria = {
  id: string | number;
  nome: string;
};

type Servico = {
  id: string | number;
  nome: string;
  descricao: string;
  preco: number | string;
  imagem?: string;
};

function normalizarCategorias(response: unknown): Categoria[] {
  const listaChaves = ['data', 'content', 'categorias'];

  if (Array.isArray(response)) {
    const categorias: Categoria[] = [];

    response.forEach((item, index) => {
      const categoria = item as Record<string, unknown>;
      const nome = String(categoria.nome || categoria.name || '').trim();
      if (!nome) {
        return;
      }

      categorias.push({
        id: (categoria.id as string | number) ?? `categoria-${index}`,
        nome,
      });
    });

    return categorias;
  }

  if (response && typeof response === 'object') {
    const payload = response as Record<string, unknown>;
    for (const chave of listaChaves) {
      if (Array.isArray(payload[chave])) {
        return normalizarCategorias(payload[chave]);
      }
    }
  }

  return [];
}

function normalizarServicos(response: unknown): Servico[] {
  const listaChaves = ['data', 'content', 'servicos'];

  if (Array.isArray(response)) {
    const servicos: Servico[] = [];

    response.forEach((item, index) => {
      const servico = item as Record<string, unknown>;
      const nome = String(servico.nome || servico.name || '').trim();
      if (!nome) {
        return;
      }

      servicos.push({
        id: (servico.id as string | number) ?? `servico-${index}`,
        nome,
        descricao: String(servico.descricao || servico.description || ''),
        preco: servico.preco as number | string,
        imagem: String(servico.imagem || ''),
      });
    });

    return servicos;
  }

  if (response && typeof response === 'object') {
    const payload = response as Record<string, unknown>;
    for (const chave of listaChaves) {
      if (Array.isArray(payload[chave])) {
        return normalizarServicos(payload[chave]);
      }
    }
  }

  return [];
}

function formatarPreco(preco?: string | number) {
  if (typeof preco === 'number') {
    return preco.toFixed(2).replace('.', ',');
  }

  if (typeof preco === 'string' && preco.trim()) {
    return preco;
  }

  return null;
}

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionadaId, setCategoriaSelecionadaId] = useState<
    string | number | null
  >(null);
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
    setCategorias(normalizarCategorias(response));
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
      await carregarCategorias();
      await carregarServicos();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar a home.';
      setErro(mensagem);
      setCategorias([]);
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, [carregarCategorias, carregarServicos]);

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
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#B30000" />
        <Text className="mt-3 text-base text-gray-700">Carregando home...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-200">
      <Header
        categorias={categorias}
        categoriaSelecionadaId={categoriaSelecionadaId}
        onSelecionarCategoria={selecionarCategoria}
      />
      <View className="flex-1 w-full">
        {erro ? <Text className="mb-4 text-sm text-red-600">{erro}</Text> : null}

        <ScrollView
          className="flex-1 w-full pt-5"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Destaque />

          <View className="w-full bg-white px-5 mt-5 rounded-tl-3xl rounded-tr-3xl pt-5">
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
    </View>
  );
}
