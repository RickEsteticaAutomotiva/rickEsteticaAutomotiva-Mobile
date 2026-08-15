import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useCarrinho } from '../context/CarrinhoContext';
import { IMAGEM_PADRAO } from '../constants/imagensServicos';

const DURACAO_MS = 650;
const TAMANHO_IMAGEM = 40;

type Posicao = { x: number; y: number };
type Animacao = { id: number; origem: Posicao; destino: Posicao; imagem?: ImageSourcePropType };

function ItemVoando({ animacao, onFinalizar }: { animacao: Animacao; onFinalizar: () => void }) {
  const progresso = useSharedValue(0);

  useEffect(() => {
    progresso.value = withTiming(
      1,
      { duration: DURACAO_MS, easing: Easing.in(Easing.cubic) },
      (finalizado) => {
        if (finalizado) {
          runOnJS(onFinalizar)();
        }
      }
    );
    // Roda apenas uma vez, quando a animação entra na tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const estilo = useAnimatedStyle(() => {
    const { origem, destino } = animacao;

    // Um pequeno arco para cima antes de cair no carrinho, para não parecer
    // um deslizamento reto.
    const arco = interpolate(progresso.value, [0, 0.5, 1], [0, -60, 0]);

    const x = interpolate(progresso.value, [0, 1], [origem.x, destino.x]);
    const y = interpolate(progresso.value, [0, 1], [origem.y, destino.y]) + arco;

    const escala = interpolate(progresso.value, [0, 0.7, 1], [1, 1, 0.4]);
    const opacidade = interpolate(progresso.value, [0, 0.8, 1], [1, 1, 0]);

    return {
      position: 'absolute',
      left: x - TAMANHO_IMAGEM / 2,
      top: y - TAMANHO_IMAGEM / 2,
      opacity: opacidade,
      transform: [{ scale: escala }],
    };
  });

  return (
    <Animated.View style={estilo}>
      <Image
        source={animacao.imagem ?? IMAGEM_PADRAO}
        style={styles.imagem}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  imagem: {
    width: TAMANHO_IMAGEM,
    height: TAMANHO_IMAGEM,
    borderRadius: TAMANHO_IMAGEM / 2,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

export function CarrinhoAnimacaoOverlay() {
  const { animacoes, removerAnimacao } = useCarrinho();

  if (animacoes.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {animacoes.map((animacao) => (
        <ItemVoando
          key={animacao.id}
          animacao={animacao}
          onFinalizar={() => removerAnimacao(animacao.id)}
        />
      ))}
    </View>
  );
}
