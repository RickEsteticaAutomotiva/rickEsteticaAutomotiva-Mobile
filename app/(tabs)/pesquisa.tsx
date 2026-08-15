import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoriaService } from '@/services/CategoriaService';
import { servicosService } from '@/services/ServicosService';
import { normalizarCategorias, normalizarServicos } from '@/utils/normalizacao';
import type { Categoria, Servico } from '@/types';

const ATRASO_DEBOUNCE_MS = 400;
const TAMANHO_SUGESTOES = 8;

export default function Pesquisa() {
  const { termoInicial } = useLocalSearchParams<{ termoInicial?: string }>();

  const [termo, setTermo] = useState(termoInicial ?? '');
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [sugestoesServicos, setSugestoesServicos] = useState<Servico[]>([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
  const [erroSugestoes, setErroSugestoes] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);
  const requisicaoIdRef = useRef(0);

  // Lista de categorias carregada uma única vez; sugestões de categoria são
  // filtradas localmente a cada tecla, sem gerar requisições extras.
  useEffect(() => {
    categoriaService
      .buscarTodas()
      .then((response) => setTodasCategorias(normalizarCategorias(response)))
      .catch(() => setTodasCategorias([]));
  }, []);

  useEffect(() => {
    const termoBusca = termo.trim();

    if (!termoBusca) {
      requisicaoIdRef.current += 1;
      setSugestoesServicos([]);
      setErroSugestoes(null);
      setBuscandoSugestoes(false);
      return;
    }

    const idRequisicao = ++requisicaoIdRef.current;
    setBuscandoSugestoes(true);
    setErroSugestoes(null);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await servicosService.pesquisar(termoBusca, {
          tamanho: TAMANHO_SUGESTOES,
        });

        if (idRequisicao !== requisicaoIdRef.current) {
          return;
        }

        setSugestoesServicos(normalizarServicos(response));
      } catch (error) {
        if (idRequisicao !== requisicaoIdRef.current) {
          return;
        }

        const mensagem =
          error instanceof Error ? error.message : 'Não foi possível carregar as sugestões.';
        setErroSugestoes(mensagem);
        setSugestoesServicos([]);
      } finally {
        if (idRequisicao === requisicaoIdRef.current) {
          setBuscandoSugestoes(false);
        }
      }
    }, ATRASO_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [termo]);

  const sugestoesCategorias = useMemo(() => {
    const termoBusca = termo.trim().toLowerCase();

    if (!termoBusca) {
      return [];
    }

    return todasCategorias.filter((categoria) =>
      categoria.nome.toLowerCase().includes(termoBusca)
    );
  }, [termo, todasCategorias]);

  function executarPesquisa(termoPesquisado: string) {
    const termoFinal = termoPesquisado.trim();

    if (!termoFinal) {
      return;
    }

    router.push({
      pathname: '/pesquisa/resultados',
      params: { termo: termoFinal },
    });
  }

  function selecionarCategoria(categoria: Categoria) {
    router.push({
      pathname: '/categoria/[categoriaId]',
      params: { categoriaId: String(categoria.id) },
    });
  }

  function selecionarServico(servico: Servico) {
    setTermo(servico.nome);
    executarPesquisa(servico.nome);
  }

  const termoDigitado = termo.trim().length > 0;
  const semSugestoes =
    termoDigitado &&
    !buscandoSugestoes &&
    !erroSugestoes &&
    sugestoesServicos.length === 0 &&
    sugestoesCategorias.length === 0;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#B30000' }}>
        <View className="flex-row items-center gap-3 px-4 pb-4 pt-4">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </Pressable>

          <View className="flex-1 flex-row items-center rounded-full bg-white px-3 py-2">
            <Ionicons name="search-outline" size={20} color="#696b6e" />

            <TextInput
              ref={inputRef}
              autoFocus
              value={termo}
              onChangeText={setTermo}
              placeholder="Pesquisar serviços..."
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              onSubmitEditing={() => executarPesquisa(termo)}
              className="ml-2 flex-1 text-base text-gray-900"
            />

            {termo.length > 0 ? (
              <Pressable onPress={() => setTermo('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {!termoDigitado ? (
          <View className="items-center px-6 py-16">
            <Ionicons name="search-outline" size={32} color="#D1D5DB" />
            <Text className="mt-3 text-center text-base text-gray-500">
              Pesquise por serviços ou categorias
            </Text>
          </View>
        ) : buscandoSugestoes ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#B30000" />
            <Text className="mt-2 text-sm text-gray-500">Buscando...</Text>
          </View>
        ) : erroSugestoes ? (
          <Text className="px-4 py-10 text-center text-sm text-red-600">{erroSugestoes}</Text>
        ) : semSugestoes ? (
          <Text className="px-4 py-10 text-center text-sm text-gray-500">
            Nenhuma sugestão encontrada
          </Text>
        ) : (
          <View className="px-4 py-2">
            {sugestoesCategorias.length > 0 ? (
              <View className="mb-4">
                <Text className="mb-1 text-xs font-semibold uppercase text-gray-400">
                  Categorias
                </Text>

                {sugestoesCategorias.map((categoria) => (
                  <Pressable
                    key={String(categoria.id)}
                    onPress={() => selecionarCategoria(categoria)}
                    className="flex-row items-center border-b border-gray-100 py-3"
                  >
                    <Ionicons name="pricetag-outline" size={18} color="#696b6e" />
                    <Text className="ml-3 text-base text-gray-800">{categoria.nome}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {sugestoesServicos.length > 0 ? (
              <View>
                <Text className="mb-1 text-xs font-semibold uppercase text-gray-400">
                  Serviços
                </Text>

                {sugestoesServicos.map((servico) => (
                  <Pressable
                    key={String(servico.id)}
                    onPress={() => selecionarServico(servico)}
                    className="flex-row items-center border-b border-gray-100 py-3"
                  >
                    <Ionicons name="search-outline" size={18} color="#696b6e" />
                    <Text className="ml-3 text-base text-gray-800">{servico.nome}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
