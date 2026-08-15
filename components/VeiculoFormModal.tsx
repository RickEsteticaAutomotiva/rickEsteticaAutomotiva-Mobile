import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { Veiculo } from '../types';
import { validarVeiculo } from '../utils/validacao/veiculoValidacao';
import { Alerta } from './Alerta';
import { Button } from './Button';
import { CampoTexto } from './CampoTexto';

const PORTES = ['Pequeno', 'Médio', 'Grande'];

type DadosVeiculoForm = {
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
  porte: string;
};

type VeiculoFormModalProps = {
  visible: boolean;
  veiculo?: Veiculo | null;
  loading?: boolean;
  erro?: string | null;
  onClose: () => void;
  onSubmit: (dados: DadosVeiculoForm) => void;
};

const FORM_VAZIO: DadosVeiculoForm = {
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
  placa: '',
  porte: 'Médio',
};

export function VeiculoFormModal({
  visible,
  veiculo = null,
  loading = false,
  erro = null,
  onClose,
  onSubmit,
}: VeiculoFormModalProps) {
  const [dados, setDados] = useState<DadosVeiculoForm>(FORM_VAZIO);
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});

  const emEdicao = veiculo !== null;

  useEffect(() => {
    if (visible) {
      setDados(
        veiculo
          ? {
              marca: veiculo.marca || '',
              modelo: veiculo.modelo || '',
              ano: veiculo.ano || '',
              cor: veiculo.cor || '',
              placa: veiculo.placa || '',
              porte: veiculo.porte || 'Médio',
            }
          : FORM_VAZIO
      );
      setErrosCampos({});
    }
  }, [visible, veiculo]);

  function atualizarCampo(campo: keyof DadosVeiculoForm, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  function handleSalvar() {
    if (loading) {
      return;
    }

    const validacao = validarVeiculo(dados);
    setErrosCampos(validacao.errors as unknown as Record<string, string>);

    if (!validacao.isValid) {
      return;
    }

    onSubmit({ ...dados, placa: dados.placa.trim().toUpperCase() });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="max-h-[90%] w-full rounded-lg bg-white p-5 shadow">
          <Text className="text-xl font-bold text-gray-900">
            {emEdicao ? 'Editar veículo' : 'Adicionar veículo'}
          </Text>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {erro ? <Alerta tipo="erro" mensagem={erro} /> : null}

            <CampoTexto
              label="Marca"
              placeholder="Ex: Chevrolet"
              value={dados.marca}
              onChangeText={(texto) => atualizarCampo('marca', texto)}
              editable={!loading}
              error={errosCampos.marca}
              semMargemSuperior
            />

            <CampoTexto
              label="Modelo"
              placeholder="Ex: Onix"
              value={dados.modelo}
              onChangeText={(texto) => atualizarCampo('modelo', texto)}
              editable={!loading}
              error={errosCampos.modelo}
            />

            <CampoTexto
              label="Ano"
              placeholder="Ex: 2021"
              value={dados.ano}
              onChangeText={(texto) => atualizarCampo('ano', texto)}
              keyboardType="numeric"
              editable={!loading}
              error={errosCampos.ano}
            />

            <CampoTexto
              label="Cor"
              placeholder="Ex: Prata"
              value={dados.cor}
              onChangeText={(texto) => atualizarCampo('cor', texto)}
              editable={!loading}
              error={errosCampos.cor}
            />

            <CampoTexto
              label="Placa"
              placeholder="Ex: ABC1234"
              value={dados.placa}
              onChangeText={(texto) => atualizarCampo('placa', texto)}
              autoCapitalize="characters"
              editable={!loading}
              error={errosCampos.placa}
            />

            <Text className="mb-2 mt-4 text-base font-semibold text-gray-900">Porte</Text>
            <View className="flex-row gap-2">
              {PORTES.map((porte) => (
                <Pressable
                  key={porte}
                  onPress={() => atualizarCampo('porte', porte)}
                  disabled={loading}
                  className="flex-1 items-center justify-center rounded-lg border py-3"
                  style={{
                    borderColor: dados.porte === porte ? '#B30000' : '#d1d5db',
                    backgroundColor: dados.porte === porte ? '#FEF2F2' : '#FFFFFF',
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: dados.porte === porte ? '#B30000' : '#374151' }}
                  >
                    {porte}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

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
