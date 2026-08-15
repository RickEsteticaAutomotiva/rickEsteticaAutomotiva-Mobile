import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { CancelarAgendamentoModal } from '@/components/CancelarAgendamentoModal';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { EstadoErro } from '@/components/EstadoErro';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { ordemServicoService } from '../../services/OrdemServicoService';
import { normalizarOrdensServico } from '../../utils/normalizacao';
import { formatarPreco, formatarDataHorarioCompleto } from '../../utils';
import type { OrdemServico } from '../../types';

const STATUS_CANCELAVEIS = [1, 2, 3];

export default function HistoricoDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [ordem, setOrdem] = useState<OrdemServico | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState<string | null>(null);
  const [sucessoCancelamento, setSucessoCancelamento] = useState<string | null>(null);

  const carregarOrdem = useCallback(async () => {
    if (!id || !user?.id) {
      setErro('Agendamento inválido.');
      setLoading(false);
      return;
    }

    setErro(null);

    try {
      const response = await ordemServicoService.buscarOrdemServicoPorUsuario(user.id);
      const ordens = normalizarOrdensServico(response);
      const encontrada = ordens.find((item) => String(item.id) === String(id)) ?? null;

      if (!encontrada) {
        setErro('Não foi possível encontrar este agendamento.');
      }

      setOrdem(encontrada);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar o agendamento.';
      setErro(mensagem);
      setOrdem(null);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    carregarOrdem();
  }, [carregarOrdem]);

  function abrirModalCancelamento() {
    setErroCancelamento(null);
    setModalVisivel(true);
  }

  function fecharModalCancelamento() {
    if (cancelando) {
      return;
    }
    setModalVisivel(false);
  }

  async function handleConfirmarCancelamento({
    motivoId,
    observacoes,
  }: {
    motivoId: number;
    observacoes: string;
  }) {
    if (!ordem || cancelando) {
      return;
    }

    setCancelando(true);
    setErroCancelamento(null);

    try {
      await ordemServicoService.atualizarStatus(ordem.id, 4, motivoId, observacoes);
      setModalVisivel(false);
      setSucessoCancelamento('Agendamento cancelado com sucesso.');
      await carregarOrdem();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível cancelar o agendamento.';
      setErroCancelamento(mensagem);
    } finally {
      setCancelando(false);
    }
  }

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando agendamento..." />;
  }

  if (erro || !ordem) {
    return <EstadoErro mensagem={erro || 'Agendamento não encontrado.'} />;
  }

  const podeCancelar = ordem.status.id !== null && STATUS_CANCELAVEIS.includes(ordem.status.id);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#f7f7f7' }} contentContainerStyle={{ padding: 16 }}>
      {sucessoCancelamento ? <Alerta tipo="sucesso" mensagem={sucessoCancelamento} /> : null}

      <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <StatusBadge status={ordem.status.nome} />
        </View>

        {ordem.dataAgendamento ? (
          <View className="mt-3 flex-row items-center">
            <Ionicons name="calendar-outline" size={20} color="#696b6e" />
            <Text className="ml-2 text-base text-gray-900">
              {formatarDataHorarioCompleto(ordem.dataAgendamento)}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-900">Veículo</Text>

        {ordem.veiculo ? (
          <View className="mt-3 flex-row items-center">
            <View className="items-center justify-center rounded-lg bg-gray-100 h-[50px] w-[50px]">
              <Ionicons name="car-outline" size={24} color="#B30000" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {ordem.veiculo.marca} {ordem.veiculo.modelo}
              </Text>
              <Text className="text-sm text-gray-600">
                {[ordem.veiculo.ano, ordem.veiculo.cor, ordem.veiculo.placa].filter(Boolean).join(' • ')}
              </Text>
            </View>
          </View>
        ) : (
          <Text className="mt-2 text-sm text-gray-600">Veículo não informado.</Text>
        )}
      </View>

      <View className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-900">Serviços</Text>

        {ordem.servicos.length === 0 ? (
          <Text className="mt-2 text-sm text-gray-600">Nenhum serviço informado.</Text>
        ) : (
          ordem.servicos.map((servico) => (
            <View
              key={String(servico.id)}
              className="mt-3 flex-row justify-between border-b border-gray-100 pb-3"
            >
              <Text className="flex-1 pr-2 text-sm text-gray-800">{servico.nome}</Text>
              <Text className="text-sm text-gray-900">{formatarPreco(servico.preco)}</Text>
            </View>
          ))
        )}

        <View className="mt-3 flex-row justify-between">
          <Text className="text-base font-bold text-gray-900">Valor total</Text>
          <Text className="text-base font-bold text-gray-900">{formatarPreco(ordem.precoTotal)}</Text>
        </View>
      </View>

      {ordem.observacoes ? (
        <View className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900">Observações</Text>
          <Text className="mt-2 text-sm text-gray-700">{ordem.observacoes}</Text>
        </View>
      ) : null}

      {ordem.status.id === 4 && ordem.motivoCancelamento ? (
        <View className="mt-4 rounded-lg bg-red-100 p-4">
          <Text className="text-sm font-semibold text-red-800">Motivo do cancelamento</Text>
          <Text className="mt-1 text-sm text-red-700">{ordem.motivoCancelamento}</Text>
        </View>
      ) : null}

      {erroCancelamento ? <Alerta tipo="erro" mensagem={erroCancelamento} className="mt-4" /> : null}

      {podeCancelar ? (
        <Button
          texto="Cancelar agendamento"
          onClick={abrirModalCancelamento}
          className="mt-5 mb-4 border border-red-700"
          textClassName="text-red-700"
        />
      ) : null}

      <CancelarAgendamentoModal
        visible={modalVisivel}
        loading={cancelando}
        erro={erroCancelamento}
        onClose={fecharModalCancelamento}
        onConfirm={handleConfirmarCancelamento}
      />
    </ScrollView>
  );
}
