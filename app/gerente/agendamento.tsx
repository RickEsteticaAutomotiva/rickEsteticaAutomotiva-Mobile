import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '@/components/Alerta';
import { CardAgendamentoHoje } from '@/components/gerente/CardAgendamentoHoje';
import { ModalOrdemServico } from '@/components/gerente/ModalOrdemServico';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { obterIdStatusPorNome, STATUS_CANCELADO, STATUS_CONCLUIDO } from '../../constants/statusOrdemServico';
import { ordemServicoService } from '../../services/OrdemServicoService';
import { normalizarOrdensServico } from '../../utils/normalizacao';
import { formatarDataCompleta } from '../../utils';
import type { OrdemServico } from '../../types';

function idStatus(ordem: OrdemServico) {
  return ordem.status.id ?? obterIdStatusPorNome(ordem.status.nome);
}

export default function AgendamentoGerente() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemServico | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const resposta = await ordemServicoService.buscarAgendamentosHoje();
      setOrdens(normalizarOrdensServico(resposta));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar os agendamentos de hoje.');
      setOrdens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const proximoAgendamento = useMemo(() => {
    return [...ordens]
      .filter((ordem) => {
        const id = idStatus(ordem);
        return id !== STATUS_CANCELADO && id !== STATUS_CONCLUIDO;
      })
      .sort((a, b) => {
        const dataA = a.dataAgendamento ? new Date(a.dataAgendamento).getTime() : 0;
        const dataB = b.dataAgendamento ? new Date(b.dataAgendamento).getTime() : 0;
        return dataA - dataB;
      })[0];
  }, [ordens]);

  function handleOrdemAtualizada(ordemAtualizada: OrdemServico) {
    setOrdens((atual) => atual.map((ordem) => (ordem.id === ordemAtualizada.id ? ordemAtualizada : ordem)));
    setOrdemSelecionada(ordemAtualizada);
  }

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando agendamentos de hoje..." />;
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="mb-3 text-sm text-gray-500">{formatarDataCompleta(new Date().toISOString())}</Text>

        {erro ? <Alerta tipo="erro" mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregar} /> : null}

        {proximoAgendamento ? (
          <View className="mb-4">
            <Text className="mb-2 text-xs font-semibold uppercase text-gray-400">Próximo agendamento</Text>
            <CardAgendamentoHoje ordem={proximoAgendamento} onPress={() => setOrdemSelecionada(proximoAgendamento)} />
          </View>
        ) : null}

        <Text className="mb-2 text-xs font-semibold uppercase text-gray-400">
          Agendamentos de hoje ({ordens.length})
        </Text>

        {!erro && ordens.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-base text-gray-500">Nenhum agendamento para hoje.</Text>
          </View>
        ) : null}

        {ordens.map((ordem) => (
          <CardAgendamentoHoje key={ordem.id} ordem={ordem} onPress={() => setOrdemSelecionada(ordem)} />
        ))}

        <View className="h-4" />
      </ScrollView>

      <ModalOrdemServico
        visible={ordemSelecionada !== null}
        ordemResumo={ordemSelecionada}
        onClose={() => setOrdemSelecionada(null)}
        onOrdemAtualizada={handleOrdemAtualizada}
      />
    </SafeAreaView>
  );
}
