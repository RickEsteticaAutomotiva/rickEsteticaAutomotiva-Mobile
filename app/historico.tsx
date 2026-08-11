import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { EstadoErro } from '@/components/EstadoErro';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ordemServicoService } from '../services/OrdemServicoService';
import { normalizarOrdensServico } from '../utils/normalizacao';
import { formatarPreco, formatarDataHorario } from '../utils';
import type { OrdemServico } from '../types';

export default function Historico() {
  const { user } = useAuth();

  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarHistorico = useCallback(async () => {
    if (!user?.id) {
      setOrdens([]);
      setLoading(false);
      return;
    }

    setErro(null);

    try {
      const response = await ordemServicoService.buscarOrdemServicoPorUsuario(user.id);
      setOrdens(normalizarOrdensServico(response));
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar seu histórico.';
      setErro(mensagem);
      setOrdens([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarHistorico();
    setRefreshing(false);
  }, [carregarHistorico]);

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando seu histórico..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregarHistorico} />;
  }

  return (
    <FlatList
      className="flex-1"
      style={{ backgroundColor: '#f7f7f7' }}
      contentContainerStyle={
        ordens.length === 0 ? { flexGrow: 1 } : { padding: 16 }
      }
      data={ordens}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center px-5">
          <Ionicons name="time-outline" size={32} color="#a0a0a0" />
          <Text className="mt-2 text-center text-base text-gray-600">
            Você ainda não tem agendamentos.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/historico/[id]', params: { id: String(item.id) } })
          }
          className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <View className="flex-row items-center justify-between">
            <StatusBadge status={item.status.nome} />
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </View>

          <Text className="mt-3 text-base font-semibold text-gray-900">
            Agendamento #{item.id}
          </Text>

          <Text className="mt-3 text-base font-semibold text-gray-900">
            {item.veiculo ? `${item.veiculo.marca} ${item.veiculo.modelo}` : 'Veículo não informado'}
          </Text>

          {item.dataAgendamento ? (
            <Text className="mt-1 text-sm text-gray-600">
              {formatarDataHorario(item.dataAgendamento)}
            </Text>
          ) : null}

          <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
            <Text className="text-sm text-gray-600">
              {item.servicos.length} serviço{item.servicos.length === 1 ? '' : 's'}
            </Text>
            <Text className="text-base font-semibold text-gray-900">
              {formatarPreco(item.precoTotal)}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}
