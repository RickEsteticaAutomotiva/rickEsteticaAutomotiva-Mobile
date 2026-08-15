import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { MotivosCancelamento } from '../utils/enum/MotivosCancelamento';
import { Alerta } from './Alerta';
import { Button } from './Button';
import { Input } from './Input';

const OPCOES_MOTIVO = Object.values(MotivosCancelamento) as { id: number; key: string; label: string }[];
const ID_OUTROS = MotivosCancelamento.OUTROS.id;

type CancelarAgendamentoModalProps = {
  visible: boolean;
  loading?: boolean;
  erro?: string | null;
  onClose: () => void;
  onConfirm: (dados: { motivoId: number; observacoes: string }) => void;
};

export function CancelarAgendamentoModal({
  visible,
  loading = false,
  erro = null,
  onClose,
  onConfirm,
}: CancelarAgendamentoModalProps) {
  const [motivoId, setMotivoId] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setMotivoId(null);
      setObservacoes('');
      setErroValidacao(null);
    }
  }, [visible]);

  const precisaDetalhar = motivoId === ID_OUTROS;

  function handleConfirmar() {
    if (loading) {
      return;
    }

    if (motivoId === null) {
      setErroValidacao('Selecione o motivo do cancelamento.');
      return;
    }

    if (precisaDetalhar && !observacoes.trim()) {
      setErroValidacao('Descreva o motivo do cancelamento.');
      return;
    }

    setErroValidacao(null);
    onConfirm({ motivoId, observacoes: observacoes.trim() });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full rounded-lg bg-white p-5 shadow">
          <Text className="text-xl font-bold text-gray-900">Cancelar agendamento</Text>

          <Text className="mt-2 text-base text-gray-600">
            Selecione o motivo do cancelamento. Essa ação não poderá ser desfeita.
          </Text>

          {(erro || erroValidacao) ? (
            <Alerta tipo="erro" mensagem={erro || erroValidacao || ''} className="mt-4" />
          ) : null}

          <View className="mt-4 gap-2">
            {OPCOES_MOTIVO.map((opcao) => {
              const selecionado = motivoId === opcao.id;

              return (
                <Pressable
                  key={opcao.id}
                  onPress={() => setMotivoId(opcao.id)}
                  disabled={loading}
                  className="flex-row items-center rounded-lg border px-4 py-3"
                  style={{
                    borderColor: selecionado ? '#B30000' : '#d1d5db',
                    backgroundColor: selecionado ? '#FEF2F2' : '#FFFFFF',
                  }}
                >
                  <View
                    className="mr-3 h-5 w-5 items-center justify-center rounded-full border"
                    style={{ borderColor: selecionado ? '#B30000' : '#9CA3AF' }}
                  >
                    {selecionado ? <View className="h-2.5 w-2.5 rounded-full bg-red-700" /> : null}
                  </View>

                  <Text
                    className="text-base font-semibold"
                    style={{ color: selecionado ? '#B30000' : '#374151' }}
                  >
                    {opcao.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {precisaDetalhar ? (
            <View className="mt-4">
              <Text className="mb-2 text-base font-semibold text-gray-900">Descreva o motivo</Text>
              <Input
                placeholder="Conte o que aconteceu..."
                value={observacoes}
                onChangeText={setObservacoes}
                editable={!loading}
                multiline
              />
            </View>
          ) : null}

          <View className="mt-5 flex-row gap-3">
            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300 active:opacity-70"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-lg font-semibold text-gray-700">Voltar</Text>
            </Pressable>

            <Button
              texto="Confirmar cancelamento"
              onClick={handleConfirmar}
              loading={loading}
              className="flex-1 bg-red-700"
              textClassName="text-white"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
