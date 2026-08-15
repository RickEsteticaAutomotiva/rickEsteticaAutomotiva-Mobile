import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

export type FaixaPreco = 'todos' | 'ate50' | '50a100' | 'acima100';
export type Ordenacao = 'relevancia' | 'menorPreco' | 'maiorPreco' | 'nomeAsc' | 'nomeDesc';

export type FiltrosServicos = {
  faixaPreco: FaixaPreco;
  ordenacao: Ordenacao;
};

export const FILTROS_SERVICOS_PADRAO: FiltrosServicos = {
  faixaPreco: 'todos',
  ordenacao: 'relevancia',
};

const OPCOES_ORDENACAO: { valor: Ordenacao; label: string }[] = [
  { valor: 'relevancia', label: 'Relevância' },
  { valor: 'menorPreco', label: 'Mais baratos' },
  { valor: 'maiorPreco', label: 'Mais caros' },
  { valor: 'nomeAsc', label: 'Nome A-Z' },
  { valor: 'nomeDesc', label: 'Nome Z-A' },
];

const OPCOES_FAIXA_PRECO: { valor: FaixaPreco; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'ate50', label: 'Até R$ 50' },
  { valor: '50a100', label: 'R$ 50 - R$ 100' },
  { valor: 'acima100', label: 'Acima de R$ 100' },
];

type FiltrosServicosModalProps = {
  visible: boolean;
  filtros: FiltrosServicos;
  onFechar: () => void;
  onAplicar: (filtros: FiltrosServicos) => void;
  onLimpar: () => void;
};

function OpcaoFiltro({
  label,
  selecionada,
  onPress,
}: {
  label: string;
  selecionada: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-2.5">
      <View
        className="mr-3 h-5 w-5 items-center justify-center rounded-full border-2"
        style={{ borderColor: selecionada ? '#B30000' : '#D1D5DB' }}
      >
        {selecionada ? (
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#B30000' }} />
        ) : null}
      </View>

      <Text className={`text-base ${selecionada ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FiltrosServicosModal({
  visible,
  filtros,
  onFechar,
  onAplicar,
  onLimpar,
}: FiltrosServicosModalProps) {
  const [rascunho, setRascunho] = useState<FiltrosServicos>(filtros);

  useEffect(() => {
    if (visible) {
      setRascunho(filtros);
    }
  }, [visible, filtros]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFechar}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[85%] rounded-t-2xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Filtros</Text>

            <Pressable onPress={onFechar} hitSlop={8}>
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
            <Text className="mt-3 text-base font-semibold text-gray-900">Ordenar por</Text>

            {OPCOES_ORDENACAO.map((opcao) => (
              <OpcaoFiltro
                key={opcao.valor}
                label={opcao.label}
                selecionada={rascunho.ordenacao === opcao.valor}
                onPress={() => setRascunho((atual) => ({ ...atual, ordenacao: opcao.valor }))}
              />
            ))}

            <Text className="mt-5 text-base font-semibold text-gray-900">Faixa de preço</Text>

            {OPCOES_FAIXA_PRECO.map((opcao) => (
              <OpcaoFiltro
                key={opcao.valor}
                label={opcao.label}
                selecionada={rascunho.faixaPreco === opcao.valor}
                onPress={() => setRascunho((atual) => ({ ...atual, faixaPreco: opcao.valor }))}
              />
            ))}
          </ScrollView>

          <View className="mt-5 flex-row gap-3">
            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300 active:opacity-70"
              onPress={() => {
                setRascunho(FILTROS_SERVICOS_PADRAO);
                onLimpar();
              }}
            >
              <Text className="text-lg font-semibold text-gray-700">Limpar</Text>
            </Pressable>

            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-lg active:opacity-70"
              style={{ backgroundColor: '#B30000' }}
              onPress={() => onAplicar(rascunho)}
            >
              <Text className="text-lg font-semibold text-white">Aplicar filtros</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
