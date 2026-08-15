import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { ServicoInicioCard } from '@/components/ServicoInicioCard';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { EstadoErro } from '@/components/EstadoErro';
import {
  FILTROS_SERVICOS_PADRAO,
  FiltrosServicos,
  FiltrosServicosModal,
} from '@/components/FiltrosServicosModal';
import { servicosService } from '@/services/ServicosService';
import { normalizarServicos } from '@/utils/normalizacao';
import type { Servico } from '@/types';

export default function ResultadosPesquisa() {
  const { termo: termoParam } = useLocalSearchParams<{ termo?: string }>();
  const termo = termoParam ?? '';

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosServicos>(FILTROS_SERVICOS_PADRAO);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  const carregarDados = useCallback(async () => {
    const termoBusca = termo.trim();

    if (!termoBusca) {
      setErro('Pesquisa inválida.');
      setServicos([]);
      setLoading(false);
      return;
    }

    setErro(null);

    try {
      const response = await servicosService.pesquisar(termoBusca);
      setServicos(normalizarServicos(response));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível realizar a pesquisa.';
      setErro(mensagem);
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, [termo]);

  // Nova pesquisa (novo `termo`) deve substituir por completo os resultados
  // anteriores, então reiniciamos o loading a cada mudança de termo.
  useEffect(() => {
    setLoading(true);
    setFiltros(FILTROS_SERVICOS_PADRAO);
    carregarDados();
  }, [carregarDados]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  }, [carregarDados]);

  const servicosFiltrados = useMemo(() => {
    const filtrados = servicos.filter((servico) => {
      const preco = Number(servico.preco) || 0;

      switch (filtros.faixaPreco) {
        case 'ate50':
          return preco <= 50;
        case '50a100':
          return preco > 50 && preco <= 100;
        case 'acima100':
          return preco > 100;
        default:
          return true;
      }
    });

    const ordenados = [...filtrados];

    switch (filtros.ordenacao) {
      case 'menorPreco':
        ordenados.sort((a, b) => (Number(a.preco) || 0) - (Number(b.preco) || 0));
        break;
      case 'maiorPreco':
        ordenados.sort((a, b) => (Number(b.preco) || 0) - (Number(a.preco) || 0));
        break;
      case 'nomeAsc':
        ordenados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        break;
      case 'nomeDesc':
        ordenados.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR'));
        break;
      default:
        break;
    }

    return ordenados;
  }, [servicos, filtros]);

  const filtrosAtivos =
    filtros.faixaPreco !== FILTROS_SERVICOS_PADRAO.faixaPreco ||
    filtros.ordenacao !== FILTROS_SERVICOS_PADRAO.ordenacao;

  function limparFiltros() {
    setFiltros(FILTROS_SERVICOS_PADRAO);
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: '#B30000' }}>
      <Header
        mostrarCategorias={false}
        mostrarVoltar
        valorPesquisa={termo}
        onPressPesquisa={() =>
          router.push({ pathname: '/pesquisa', params: { termoInicial: termo } })
        }
      />

      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <Text className="text-sm text-gray-600">
          {servicosFiltrados.length} serviço{servicosFiltrados.length === 1 ? '' : 's'} encontrado
          {servicosFiltrados.length === 1 ? '' : 's'}
        </Text>

        <View className="flex-row items-center gap-3">
          {filtrosAtivos ? (
            <Pressable onPress={limparFiltros}>
              <Text className="text-sm font-semibold text-red-700">Limpar filtros</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => setFiltrosVisiveis(true)}
            className="flex-row items-center rounded-full border border-gray-300 px-3 py-1.5"
          >
            <Ionicons name="options-outline" size={16} color="#374151" />
            <Text className="ml-1 text-sm text-gray-700">
              Filtros{filtrosAtivos ? ' •' : ''}
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <EstadoCarregamento mensagem="Buscando serviços..." />
      ) : erro ? (
        <EstadoErro
          mensagem={erro}
          acaoTexto="Tentar novamente"
          onAcao={carregarDados}
        />
      ) : (
        <ScrollView
          className="flex-1 bg-white"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View className="bg-white px-4 pt-4">
            {servicosFiltrados.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-base font-semibold text-gray-900">
                  Nenhum resultado encontrado
                </Text>
                <Text className="mt-2 text-center text-sm text-gray-500">
                  Tente pesquisar por outro serviço{'\n'}ou categoria.
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between pb-4">
                {servicosFiltrados.map((servico) => (
                  <ServicoInicioCard
                    key={String(servico.id)}
                    servicoId={servico.id}
                    nome={servico.nome}
                    descricao={servico.descricao}
                    preco={servico.preco}
                    imagem={servico.imagem}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <FiltrosServicosModal
        visible={filtrosVisiveis}
        filtros={filtros}
        onFechar={() => setFiltrosVisiveis(false)}
        onLimpar={limparFiltros}
        onAplicar={(novosFiltros) => {
          setFiltros(novosFiltros);
          setFiltrosVisiveis(false);
        }}
      />
    </SafeAreaView>
  );
}
