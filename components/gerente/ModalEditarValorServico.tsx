import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Alerta } from '../Alerta';
import { Button } from '../Button';
import { CampoTexto } from '../CampoTexto';

type ModalEditarValorServicoProps = {
  visible: boolean;
  nomeServico?: string;
  valorAtual?: number | string;
  loading?: boolean;
  erro?: string | null;
  onClose: () => void;
  onSubmit: (novoValor: number) => void;
};

export function ModalEditarValorServico({
  visible,
  nomeServico,
  valorAtual,
  loading = false,
  erro = null,
  onClose,
  onSubmit,
}: ModalEditarValorServicoProps) {
  const [valor, setValor] = useState('');
  const [erroCampo, setErroCampo] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setValor(valorAtual != null ? String(valorAtual) : '');
      setErroCampo(undefined);
    }
  }, [visible, valorAtual]);

  function handleSalvar() {
    if (loading) return;

    const numero = Number(valor.replace(',', '.'));
    if (!valor || Number.isNaN(numero) || numero < 0) {
      setErroCampo('Informe um valor válido');
      return;
    }

    setErroCampo(undefined);
    onSubmit(numero);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full rounded-lg bg-white p-5 shadow">
          <Text className="text-xl font-bold text-gray-900">Editar valor</Text>
          {nomeServico ? <Text className="mt-1 text-sm text-gray-600">{nomeServico}</Text> : null}

          {erro ? <Alerta tipo="erro" mensagem={erro} className="mt-3" /> : null}

          <CampoTexto
            label="Valor aplicado (R$)"
            placeholder="Ex: 80,00"
            value={valor}
            onChangeText={setValor}
            keyboardType="decimal-pad"
            editable={!loading}
            error={erroCampo}
          />

          <View className="mt-5 flex-row gap-3">
            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300 active:opacity-70"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-lg font-semibold text-gray-700">Cancelar</Text>
            </Pressable>

            <Button
              texto="Salvar"
              onClick={handleSalvar}
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
