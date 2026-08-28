import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import type { Categoria } from '../../types';
import { Alerta } from '../Alerta';
import { Button } from '../Button';
import { CampoTexto } from '../CampoTexto';
import type { DadosCategoriaForm } from '../../hooks/useCategoriasGerente';

type ModalCategoriaProps = {
  visible: boolean;
  categoria?: Categoria | null;
  loading?: boolean;
  erro?: string | null;
  onClose: () => void;
  onSubmit: (dados: DadosCategoriaForm) => void;
};

export function ModalCategoria({
  visible,
  categoria = null,
  loading = false,
  erro = null,
  onClose,
  onSubmit,
}: ModalCategoriaProps) {
  const [nome, setNome] = useState('');
  const [erroCampo, setErroCampo] = useState<string | undefined>();

  const emEdicao = categoria !== null;

  useEffect(() => {
    if (visible) {
      setNome(categoria?.nome ?? '');
      setErroCampo(undefined);
    }
  }, [visible, categoria]);

  function handleSalvar() {
    if (loading) {
      return;
    }

    const nomeAparado = nome.trim();
    if (nomeAparado.length < 3 || nomeAparado.length > 50) {
      setErroCampo('Nome deve ter entre 3 e 50 caracteres');
      return;
    }

    setErroCampo(undefined);
    onSubmit({ nome: nomeAparado });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full rounded-lg bg-white p-5 shadow">
          <Text className="text-xl font-bold text-gray-900">
            {emEdicao ? 'Editar categoria' : 'Nova categoria'}
          </Text>

          {erro ? <Alerta tipo="erro" mensagem={erro} className="mt-4" /> : null}

          <CampoTexto
            label="Nome"
            placeholder="Ex: Lavagem"
            value={nome}
            onChangeText={setNome}
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
              texto={emEdicao ? 'Salvar' : 'Adicionar'}
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
