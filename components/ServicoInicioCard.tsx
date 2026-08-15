import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { formatarPreco } from '../utils';
import { IMAGEM_PLACEHOLDER } from '../constants/imagens';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCarrinho } from '../context/CarrinhoContext';

type ServicoProps = {
  servicoId: string | number;
  nome: string;
  descricao: string;
  preco: number | string;
  imagem?: string;
  className?: string;
};

export function ServicoInicioCard({
  servicoId,
  nome,
  descricao,
  preco,
  imagem,
  className = '',
}: ServicoProps) {
  const precoFormatado = formatarPreco(preco);
  const { isAuthenticated } = useAuth();
  const { adicionarServico, dispararAnimacaoCarrinho } = useCarrinho();

  const [adicionando, setAdicionando] = useState(false);
  const [adicionado, setAdicionado] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botaoCarrinhoRef = useRef<View>(null);

  const escala = useSharedValue(1);
  const estiloBotaoCarrinho = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function medirPosicaoBotaoCarrinho(): Promise<{ x: number; y: number }> {
    return new Promise((resolve) => {
      botaoCarrinhoRef.current?.measureInWindow((x, y, width, height) => {
        resolve({ x: x + width / 2, y: y + height / 2 });
      });
    });
  }

  async function handleAdicionarCarrinho() {
    if (adicionando) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    escala.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.2, { damping: 5 }),
      withSpring(1)
    );

    setAdicionando(true);

    try {
      const origem = await medirPosicaoBotaoCarrinho();

      await adicionarServico(servicoId);
      setAdicionado(true);
      dispararAnimacaoCarrinho(origem);

      timeoutRef.current = setTimeout(() => setAdicionado(false), 1500);
    } catch {
      // Erro silencioso aqui: o usuário ainda pode adicionar ao carrinho pela tela do serviço.
    } finally {
      setAdicionando(false);
    }
  }

  return (
    <Pressable
      className={`mb-3 w-[48.5%] rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
      id={`servico-card-${servicoId}`}
      onPress={() => {
        router.push({
          pathname: '/servicos/[servicoId]',
          params: {
            servicoId: String(servicoId),
          },
        });
      }}
    >
      <View className="h-[150px] w-full overflow-hidden rounded-t-lg bg-gray-100">
        <Image
          source={{ uri: imagem || IMAGEM_PLACEHOLDER }}
          className="h-full w-full"
          resizeMode="cover"
        />

        <View
          ref={botaoCarrinhoRef}
          className="absolute right-2 bottom-2 rounded-full bg-white p-1 shadow"
        >
          <Animated.View style={estiloBotaoCarrinho}>
            <Pressable
              onPress={handleAdicionarCarrinho}
              disabled={adicionando}
              hitSlop={8}
            >
              {adicionando ? (
                <ActivityIndicator size="small" color="#2b2b2b" />
              ) : (
                <Ionicons
                  name={adicionado ? 'checkmark-circle' : 'cart-outline'}
                  size={20}
                  color={adicionado ? '#15803d' : '#2b2b2b'}
                />
              )}
            </Pressable>
          </Animated.View>
        </View>
      </View>

      <View className="p-3">
        <Text className="text-base font-semibold text-gray-900">
          {nome}
        </Text>

        <Text className="mt-1 text-sm text-gray-600">
          A partir de
        </Text>

        <Text className="text-xl font-medium text-green-700">
          {precoFormatado}
        </Text>
      </View>
    </Pressable>
  );
}