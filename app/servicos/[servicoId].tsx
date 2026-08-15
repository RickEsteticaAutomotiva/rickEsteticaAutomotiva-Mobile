import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { servicosService } from '../../services/ServicosService';
import { Mapa } from '../../components/Mapa';
import { Alerta } from '../../components/Alerta';
import { Button } from '../../components/Button';
import { EstadoCarregamento } from '../../components/EstadoCarregamento';
import { EstadoErro } from '../../components/EstadoErro';
import { formatarPreco } from '../../utils';
import { getImagemServico } from '../../constants/imagensServicos';
import { useAuth } from '../../context/AuthContext';
import { useCarrinho } from '../../context/CarrinhoContext';
import { useFavoritos } from '../../context/FavoritosContext';

export default function Servico() {
  const { servicoId } = useLocalSearchParams<{
    servicoId: string;
  }>();

  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { adicionarServico } = useCarrinho();
  const { isFavorito, alternarFavorito } = useFavoritos();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [servico, setServico] = useState<Record<string, unknown> | null>(null);
  const [adicionandoCarrinho, setAdicionandoCarrinho] = useState(false);
  const [mensagemCarrinho, setMensagemCarrinho] = useState<string | null>(null);
  const [erroCarrinho, setErroCarrinho] = useState<string | null>(null);
  const [alternandoFavorito, setAlternandoFavorito] = useState(false);
  const [erroFavorito, setErroFavorito] = useState<string | null>(null);

  const carregarServico = useCallback(async () => {
    if (!servicoId) {
      setErro('Serviço inválido.');
      setLoading(false);
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      const response = await servicosService.buscarPorId(servicoId);

      setServico(response as Record<string, unknown>);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o serviço.';

      setErro(mensagem);
      setServico(null);
    } finally {
      setLoading(false);
    }
  }, [servicoId]);

  useEffect(() => {
    carregarServico();
  }, [carregarServico]);

  async function handleAgendarServico() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    await handleAdicionarCarrinho();

    router.push(`/carrinho`);
  }

  async function handleAdicionarCarrinho() {
    if (adicionandoCarrinho || !servico?.id) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setAdicionandoCarrinho(true);
    setErroCarrinho(null);
    setMensagemCarrinho(null);

    try {
      await adicionarServico(servico.id as string | number);
      setMensagemCarrinho('Serviço adicionado ao carrinho!');
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível adicionar ao carrinho.';
        if (mensagem === 'Esse serviço já está no carrinho deste usuário.') {
          router.push('/carrinho');
        }
      setErroCarrinho(mensagem);
    } finally {
      setAdicionandoCarrinho(false);
    }
  }

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando serviço..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} />;
  }

  const nome = String(
    servico?.nome ||
    servico?.name ||
    'Serviço'
  );

  const descricao = String(
    servico?.descricao ||
    servico?.description ||
    ''
  );

  const preco = servico?.preco
    ? formatarPreco(servico.preco as number | string)
    : null;

  const favoritado = servico?.id !== undefined && isFavorito(servico.id as string | number);

  async function handleCompartilhar() {
    try {
      await Share.share({
        title: nome,
        message: `Confira o serviço "${nome}"${preco ? ` por ${preco}` : ''} na Rick Estética Automotiva!`,
      });
    } catch {
      // Usuário cancelou o compartilhamento ou o sistema não conseguiu abrir o menu; não é um erro a ser exibido.
    }
  }

  async function handleFavoritar() {
    if (alternandoFavorito || !servico?.id) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setAlternandoFavorito(true);
    setErroFavorito(null);

    try {
      await alternarFavorito(servico.id as string | number);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível atualizar seus favoritos.';
      setErroFavorito(mensagem);
    } finally {
      setAlternandoFavorito(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
        <View className="relative h-[350px] w-full overflow-hidden bg-gray-100 mb-4">
            <Image
                source={getImagemServico(nome)}
                className="h-full w-full"
                resizeMode="cover"
            />

            <Pressable
                onPress={() => router.back()}
                style={{ top: insets.top + 12 }}
                className="absolute left-4 z-50 h-10 w-10 items-center justify-center rounded-full bg-white/80"
                >
                <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
        </View>

      <View className="px-5">

        {/* Nome + ações */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {nome}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleCompartilhar}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-200"
            >
              <Ionicons name="share-social-outline" size={24} color="#374151" />
            </Pressable>

            <Pressable
              onPress={handleFavoritar}
              disabled={alternandoFavorito}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-200"
            >
              {alternandoFavorito ? (
                <ActivityIndicator size="small" color="#B30000" />
              ) : (
                <Ionicons
                  name={favoritado ? 'heart' : 'heart-outline'}
                  size={24}
                  color={favoritado ? '#B30000' : '#374151'}
                />
              )}
            </Pressable>
          </View>
        </View>

        {erroFavorito ? <Alerta tipo="erro" mensagem={erroFavorito} className="mt-3" /> : null}

        {/* Preço */}
        <View className="mt-3 w-full rounded-lg bg-gray-100 p-4">
          <Text className="text-sm text-gray-500">
            A partir de:
          </Text>

          <Text className="mt-2 text-[25px] font-bold text-green-700">
            {preco}
          </Text>
        </View>

        {/* Botões */}
        {erroCarrinho ? <Alerta tipo="erro" mensagem={erroCarrinho} className="mt-4" /> : null}

        {mensagemCarrinho ? (
          <Alerta tipo="sucesso" mensagem={mensagemCarrinho} className="mt-4" />
        ) : null}

        <Button
          texto="Adicionar ao Carrinho"
          onClick={handleAdicionarCarrinho}
          loading={adicionandoCarrinho}
          className="mt-4 bg-red-700"
          textClassName="text-white"
        />

        <Button
          texto="Agendar Serviço"
          onClick={handleAgendarServico}
          className="mt-4 border border-green-700"
          textClassName="text-green-700"
        />

        {/* Descrição */}
        <View className="mt-4 w-full border-y border-gray-200 py-4">
          <Text className="text-lg font-bold text-gray-900">
            Descrição
          </Text>

          <Text className="mt-3 text-base text-gray-700">
            {descricao}
          </Text>
        </View>

        {/* Localização */}
        <View className="w-full border-b border-gray-200 py-4">
          <Text className="text-lg font-bold text-gray-900">
            Localização
          </Text>

          <Text className="mt-3 text-base font-semibold text-gray-700">
            Rick Estética Automotiva
          </Text>

          <Text className="mb-4 mt-3 text-base text-gray-700">
            R. Alcatifa, 81 - Jardim Brasilia (Zona Leste),
            São Paulo, 03583-030
          </Text>

          <Mapa />
        </View>

        {/* Sobre o local */}
        <View className="w-full py-4">
          <Text className="text-lg font-bold text-gray-900">
            Sobre o local
          </Text>

          <Text className="mt-3 text-base text-gray-700">
            Estamos localizados na R. Alcatifa, a oficina Rick
            Estética Automotiva é referência em cuidados
            automotivos, oferecendo serviços especializados que
            vão desde lavagens técnicas até vitrificação e
            revitalização completa de veículos. Nosso objetivo é
            proporcionar não apenas limpeza, mas também proteção,
            valorização e durabilidade para cada carro que passa
            por aqui.
          </Text>

          <Image
            source={require('../../assets/local.png')}
            className="mt-4 h-[192px] w-full rounded-lg"
            resizeMode="cover"
          />
        </View>

      </View>
    </ScrollView>
  );
}