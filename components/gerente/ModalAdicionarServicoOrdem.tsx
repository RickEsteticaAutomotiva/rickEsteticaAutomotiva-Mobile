import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { servicosService } from '../../services/ServicosService';
import { normalizarServicos } from '../../utils/normalizacao';
import { formatarPreco } from '../../utils';
import type { ItemOrdemServico, Servico } from '../../types';
import { Alerta } from '../Alerta';
import { Button } from '../Button';

type ModalAdicionarServicoOrdemProps = {
  visible: boolean;
  servicosJaNaOrdem: ItemOrdemServico[];
  loading?: boolean;
  erro?: string | null;
  onClose: () => void;
  onConfirmar: (servicosIds: Array<string | number>) => void;
};

export function ModalAdicionarServicoOrdem({
  visible,
  servicosJaNaOrdem,
  loading = false,
  erro = null,
  onClose,
  onConfirmar,
}: ModalAdicionarServicoOrdemProps) {
  const [servicosDisponiveis, setServicosDisponiveis] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    if (!visible) return;

    setSelecionados(new Set());
    setCarregando(true);
    setErroCarregamento(null);

    const idsNaOrdem = new Set(servicosJaNaOrdem.map((servico) => servico.id));

    servicosService
      .buscarTodos({ pagina: 0, tamanho: 50, ordenarPor: 'nome' })
      .then((resposta: unknown) => {
        const todos = normalizarServicos(resposta);
        setServicosDisponiveis(todos.filter((servico) => !idsNaOrdem.has(servico.id)));
      })
      .catch((error: unknown) => {
        setErroCarregamento(error instanceof Error ? error.message : 'Não foi possível carregar os serviços.');
      })
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function alternarSelecao(id: string | number) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="max-h-[85%] w-full rounded-lg bg-white p-5 shadow">
          <Text className="text-xl font-bold text-gray-900">
            Adicionar serviços {selecionados.size > 0 ? `(${selecionados.size})` : ''}
          </Text>

          {erro ? <Alerta tipo="erro" mensagem={erro} className="mt-3" /> : null}

          {carregando ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#B30000" />
            </View>
          ) : erroCarregamento ? (
            <Alerta tipo="erro" mensagem={erroCarregamento} className="mt-3" />
          ) : servicosDisponiveis.length === 0 ? (
            <Text className="mt-4 text-center text-gray-500">
              Não há outros serviços disponíveis para adicionar.
            </Text>
          ) : (
            <ScrollView className="mt-3" style={{ maxHeight: 380 }}>
              {servicosDisponiveis.map((servico) => {
                const selecionado = selecionados.has(servico.id);
                return (
                  <Pressable
                    key={servico.id}
                    onPress={() => alternarSelecao(servico.id)}
                    className="mb-2 flex-row items-center justify-between rounded-lg border px-4 py-3"
                    style={{ borderColor: selecionado ? '#B30000' : '#e5e7eb' }}
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-semibold text-gray-900">{servico.nome}</Text>
                      <Text className="text-xs text-gray-500">{formatarPreco(servico.preco)}</Text>
                    </View>
                    <Ionicons
                      name={selecionado ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={selecionado ? '#B30000' : '#9CA3AF'}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View className="mt-5 flex-row gap-3">
            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300 active:opacity-70"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-lg font-semibold text-gray-700">Cancelar</Text>
            </Pressable>

            <Button
              texto="Adicionar"
              onClick={() => onConfirmar(Array.from(selecionados))}
              loading={loading}
              disabled={selecionados.size === 0}
              className="flex-1 bg-red-700"
              textClassName="text-white"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
