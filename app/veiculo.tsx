import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { VeiculoFormModal } from '@/components/VeiculoFormModal';
import { useAuth } from '../context/AuthContext';
import { veiculoService } from '../services/VeiculoService';
import { normalizarVeiculo, normalizarVeiculos } from '../utils/normalizacao';
import type { Veiculo } from '../types';

export default function VeiculoScreen() {
  const { user } = useAuth();

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<string | number | null>(null);

  const [modalFormVisible, setModalFormVisible] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState<Veiculo | null>(null);
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [veiculoRemovendo, setVeiculoRemovendo] = useState<Veiculo | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemocao, setErroRemocao] = useState<string | null>(null);

  const carregarVeiculos = useCallback(async () => {
    if (!user?.id) {
      setVeiculos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const response = await veiculoService.buscarVeiculosPorUsuario(user.id);
      setVeiculos(normalizarVeiculos(response));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar seus veículos.';
      setErro(mensagem);
      setVeiculos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      carregarVeiculos();
    }, [carregarVeiculos])
  );

  function abrirAdicao() {
    setVeiculoEditando(null);
    setErroForm(null);
    setModalFormVisible(true);
  }

  function abrirEdicao(veiculo: Veiculo) {
    setVeiculoEditando(veiculo);
    setErroForm(null);
    setModalFormVisible(true);
  }

  function fecharForm() {
    if (salvandoForm) {
      return;
    }
    setModalFormVisible(false);
  }

  async function handleSubmitForm(dados: {
    marca: string;
    modelo: string;
    ano: string;
    cor: string;
    placa: string;
    porte: string;
  }) {
    if (salvandoForm || !user?.id) {
      return;
    }

    setSalvandoForm(true);
    setErroForm(null);

    try {
      if (veiculoEditando) {
        await veiculoService.atualizarVeiculo({ id: veiculoEditando.id, ...dados });
        setVeiculos((atual) =>
          atual.map((veiculo) =>
            veiculo.id === veiculoEditando.id ? { ...veiculo, ...dados } : veiculo
          )
        );
      } else {
        const criado = await veiculoService.adicionarVeiculo({ idPessoa: user.id, ...dados });
        const novoVeiculo = normalizarVeiculo(criado);

        if (novoVeiculo) {
          setVeiculos((atual) => [...atual, novoVeiculo]);
          setVeiculoSelecionadoId(novoVeiculo.id);
        }
      }

      setModalFormVisible(false);
      setVeiculoEditando(null);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : veiculoEditando
            ? 'Não foi possível salvar as alterações do veículo.'
            : 'Não foi possível adicionar o veículo.';
      setErroForm(mensagem);
    } finally {
      setSalvandoForm(false);
    }
  }

  function abrirConfirmacaoRemocao(veiculo: Veiculo) {
    setVeiculoRemovendo(veiculo);
    setErroRemocao(null);
  }

  function fecharConfirmacaoRemocao() {
    if (removendo) {
      return;
    }
    setVeiculoRemovendo(null);
  }

  async function handleConfirmarRemocao() {
    if (!veiculoRemovendo || removendo) {
      return;
    }

    setRemovendo(true);
    setErroRemocao(null);

    try {
      await veiculoService.removerVeiculo(veiculoRemovendo.id);
      setVeiculos((atual) => atual.filter((veiculo) => veiculo.id !== veiculoRemovendo.id));
      setVeiculoSelecionadoId((atual) => (atual === veiculoRemovendo.id ? null : atual));
      setVeiculoRemovendo(null);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível remover este veículo. Tente novamente.';
      setErroRemocao(mensagem);
    } finally {
      setRemovendo(false);
    }
  }

  function handleAvancar() {
    if (!veiculoSelecionadoId) {
      return;
    }

    router.push({
      pathname: '/agendamento',
      params: { idVeiculo: String(veiculoSelecionadoId) },
    });
  }

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando veículos..." />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#f7f7f7' }}>
      <View className="flex-1 px-3 mt-5">
        <View className="items-center justify-center bg-white p-4 rounded-lg shadow-md border border-gray-200">

          <View className="w-full border-b border-gray-200 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Escolha um veículo que irá receber o serviço
            </Text>

            <Text className="text-base text-gray-600 mb-2">
              Selecione o veículo e clique em avançar para continuar
            </Text>
          </View>

          {erro ? (
            <Alerta
              mensagem={erro}
              className="mb-4 w-full"
              acaoTexto="Tentar novamente"
              onAcao={carregarVeiculos}
            />
          ) : null}

          {!erro && veiculos.length === 0 ? (
            <View className="mb-4 w-full items-center py-6">
              <Ionicons name="car-outline" size={32} color="#a0a0a0" />
              <Text className="mt-2 text-center text-base text-gray-600">
                Você ainda não possui veículos cadastrados.
              </Text>
            </View>
          ) : null}

          <ScrollView
            showsHorizontalScrollIndicator={false}
            className="w-full mb-4"
          >
            {veiculos.map((veiculo) => {
              const selecionado = veiculo.id === veiculoSelecionadoId;

              return (
                <Pressable
                  key={String(veiculo.id)}
                  onPress={() => setVeiculoSelecionadoId(veiculo.id)}
                  className="flex-row items-center w-[100%] mb-2 border p-2 rounded"
                  style={{ borderColor: selecionado ? '#B30000' : '#e5e7eb', backgroundColor: selecionado ? '#fee2e2ab' : '#ffffff' }}
                >
                  <View className="items-center rounded-lg h-[60px] w-[60px] justify-center" style={{ backgroundColor: selecionado ? '#fee2e2' : '#f3f4f6' }}>
                    <Ionicons name="car-outline" size={25} style={{ color: selecionado ? "#B30000" : "#a0a0a0" }} />
                  </View>

                  <View className="flex-1 ml-4">
                    <View className="flex-row items-start justify-between">
                      <Text className="text-base text-xl text-gray-900 font-semibold">
                        {veiculo.marca} {veiculo.modelo}
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap items-center mt-1 gap-3">
                      {veiculo.ano ? (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="calendar-outline" size={20} color="#a0a0a0" />
                          <Text className="text-base text-gray-900">{veiculo.ano}</Text>
                        </View>
                      ) : null}

                      {veiculo.cor ? (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="color-palette-outline" size={20} color="#a0a0a0" />
                          <Text className="text-base text-gray-900">{veiculo.cor}</Text>
                        </View>
                      ) : null}

                      {veiculo.placa ? (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="card-outline" size={20} color="#a0a0a0" />
                          <Text className="text-base text-gray-900">{veiculo.placa}</Text>
                        </View>
                      ) : null}
                    </View>

                    <View className="flex-row items-center mt-2">
                      <Pressable
                        className="mr-2 flex-row items-start"
                        onPress={() => abrirEdicao(veiculo)}
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="pencil" size={20} color="#B30000" />
                          <Text className="text-red-900 ml-2">Editar</Text>
                        </View>
                      </Pressable>

                      <Pressable
                        className="mr-2 flex-row items-start"
                        onPress={() => abrirConfirmacaoRemocao(veiculo)}
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="trash-outline" size={20} color="#B30000" />
                          <Text className="text-red-900 ml-2">Remover</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Button
            texto="Adicionar veículo"
            onClick={abrirAdicao}
            className="mt-5 mb-4 bg-white border border-gray-300 w-full"
            textClassName="text-gray-900"
          />

          <Button
            texto="Avançar"
            onClick={handleAvancar}
            disabled={!veiculoSelecionadoId}
            className="mb-4 bg-red-700 w-full"
            textClassName="text-white"
          />

        </View>
      </View>

      <VeiculoFormModal
        visible={modalFormVisible}
        veiculo={veiculoEditando}
        loading={salvandoForm}
        erro={erroForm}
        onClose={fecharForm}
        onSubmit={handleSubmitForm}
      />

      <ConfirmModal
        visible={veiculoRemovendo !== null}
        title="Remover veículo?"
        message={
          veiculoRemovendo
            ? `Tem certeza que deseja remover o ${veiculoRemovendo.marca} ${veiculoRemovendo.modelo}? Esta ação não poderá ser desfeita.`
            : ''
        }
        confirmText="Remover"
        cancelText="Cancelar"
        loading={removendo}
        erro={erroRemocao}
        onConfirm={handleConfirmarRemocao}
        onCancel={fecharConfirmacaoRemocao}
      />
    </View>
  );
}
