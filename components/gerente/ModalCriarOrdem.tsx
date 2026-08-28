import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { DadosCriarOrdemForm } from '../../hooks/useOrdensServicoGerente';
import type { Servico, Veiculo } from '../../types';
import { formatarPreco } from '../../utils';
import { Alerta } from '../Alerta';
import { Button } from '../Button';
import { CampoTexto } from '../CampoTexto';

type ModalCriarOrdemProps = {
  visible: boolean;
  veiculos: Veiculo[];
  servicos: Servico[];
  carregandoDados?: boolean;
  loading?: boolean;
  erro?: string | null;
  onClose: () => void;
  onSubmit: (dados: DadosCriarOrdemForm) => void;
};

const FORM_VAZIO: DadosCriarOrdemForm = { veiculoId: null, data: '', hora: '', servicosIds: [] };

export function ModalCriarOrdem({
  visible,
  veiculos,
  servicos,
  carregandoDados = false,
  loading = false,
  erro = null,
  onClose,
  onSubmit,
}: ModalCriarOrdemProps) {
  const [dados, setDados] = useState<DadosCriarOrdemForm>(FORM_VAZIO);
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setDados(FORM_VAZIO);
      setErrosCampos({});
    }
  }, [visible]);

  function alternarServico(id: string | number) {
    setDados((atual) => ({
      ...atual,
      servicosIds: atual.servicosIds.includes(id)
        ? atual.servicosIds.filter((s) => s !== id)
        : [...atual.servicosIds, id],
    }));
  }

  const valorEstimado = servicos
    .filter((servico) => dados.servicosIds.includes(servico.id))
    .reduce((soma, servico) => soma + (Number(servico.preco) || 0), 0);

  function validar() {
    const erros: Record<string, string> = {};

    if (dados.veiculoId === null) erros.veiculo = 'Selecione um veículo';
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dados.data)) erros.data = 'Informe uma data válida (DD/MM/AAAA)';
    if (!/^\d{2}:\d{2}$/.test(dados.hora)) erros.hora = 'Informe um horário válido (HH:MM)';
    if (dados.servicosIds.length === 0) erros.servicos = 'Selecione ao menos um serviço';

    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  }

  function handleSalvar() {
    if (loading || !validar()) return;
    onSubmit(dados);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View className="max-h-[90%] w-full rounded-lg bg-white p-5 shadow">
          <Text className="text-xl font-bold text-gray-900">Nova ordem de serviço</Text>

          {erro ? <Alerta tipo="erro" mensagem={erro} className="mt-3" /> : null}

          {carregandoDados ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#B30000" />
            </View>
          ) : (
            <ScrollView className="mt-3" showsVerticalScrollIndicator={false}>
              <Text className="text-base font-semibold text-gray-900">Veículo</Text>
              {errosCampos.veiculo ? <Text className="mt-1 text-sm text-red-600">{errosCampos.veiculo}</Text> : null}
              <View className="mt-2 flex-row flex-wrap gap-2">
                {veiculos.map((veiculo) => {
                  const selecionado = dados.veiculoId === veiculo.id;
                  return (
                    <Pressable
                      key={veiculo.id}
                      onPress={() => setDados((atual) => ({ ...atual, veiculoId: veiculo.id }))}
                      className="rounded-full border px-3 py-1.5"
                      style={{ borderColor: selecionado ? '#B30000' : '#d1d5db', backgroundColor: selecionado ? '#FEF2F2' : '#fff' }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: selecionado ? '#B30000' : '#374151' }}>
                        {veiculo.marca} {veiculo.modelo} — {veiculo.placa}
                      </Text>
                    </Pressable>
                  );
                })}
                {veiculos.length === 0 ? <Text className="text-sm text-gray-500">Nenhum veículo cadastrado.</Text> : null}
              </View>

              <CampoTexto
                label="Data do agendamento"
                placeholder="DD/MM/AAAA"
                value={dados.data}
                onChangeText={(texto) => setDados((atual) => ({ ...atual, data: texto }))}
                keyboardType="numeric"
                editable={!loading}
                error={errosCampos.data}
              />

              <CampoTexto
                label="Horário"
                placeholder="HH:MM"
                value={dados.hora}
                onChangeText={(texto) => setDados((atual) => ({ ...atual, hora: texto }))}
                keyboardType="numeric"
                editable={!loading}
                error={errosCampos.hora}
              />

              <Text className="mb-2 mt-4 text-base font-semibold text-gray-900">
                Serviços {dados.servicosIds.length > 0 ? `(${dados.servicosIds.length})` : ''}
              </Text>
              {errosCampos.servicos ? <Text className="mb-2 text-sm text-red-600">{errosCampos.servicos}</Text> : null}

              {servicos.map((servico) => {
                const selecionado = dados.servicosIds.includes(servico.id);
                return (
                  <Pressable
                    key={servico.id}
                    onPress={() => alternarServico(servico.id)}
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

              <View className="mt-2 flex-row items-center justify-between border-t border-gray-100 pt-3">
                <Text className="text-sm font-semibold text-gray-900">Valor mínimo estimado</Text>
                <Text className="text-base font-bold text-green-700">{formatarPreco(valorEstimado)}</Text>
              </View>
            </ScrollView>
          )}

          <View className="mt-5 flex-row gap-3">
            <Pressable
              className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-lg font-semibold text-gray-700">Cancelar</Text>
            </Pressable>

            <Button
              texto="Criar ordem"
              onClick={handleSalvar}
              loading={loading}
              disabled={carregandoDados}
              className="flex-1 bg-red-700"
              textClassName="text-white"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
