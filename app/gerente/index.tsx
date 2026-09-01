import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardLargo } from '@/components/gerente/CardLargo';
import { CardMedio } from '@/components/gerente/CardMedio';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { EstadoErro } from '@/components/EstadoErro';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/DashboardService';
import { formatarHorario, formatarPreco } from '../../utils';

type ProximoAgendamento = {
  servico?: string;
  hora?: string;
  dataHora?: string;
  clienteNome?: string;
  veiculoDescricao?: string;
};

type ResumoHome = {
  agendamentosHoje: number;
  faturamentoEstimadoHoje: number;
  ticketMedioEstimadoHoje: number;
  proximoAgendamento: ProximoAgendamento | null;
};

function obterHoraProximoAgendamento(agendamento: ProximoAgendamento | null) {
  if (!agendamento) {
    return '--:--';
  }
  if (agendamento.hora) {
    return agendamento.hora;
  }
  if (agendamento.dataHora) {
    return formatarHorario(agendamento.dataHora);
  }
  return '--:--';
}

export default function HomeGerente() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoHome>({
    agendamentosHoje: 0,
    faturamentoEstimadoHoje: 0,
    ticketMedioEstimadoHoje: 0,
    proximoAgendamento: null,
  });

  const carregarResumo = useCallback(async () => {
    setLoading(true);
    try {
      const response = (await dashboardService.homeResumo()) as Partial<ResumoHome>;
      setResumo({
        agendamentosHoje: Number(response?.agendamentosHoje || 0),
        faturamentoEstimadoHoje: Number(response?.faturamentoEstimadoHoje || 0),
        ticketMedioEstimadoHoje: Number(response?.ticketMedioEstimadoHoje || 0),
        proximoAgendamento: response?.proximoAgendamento || null,
      });
      setErro(null);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao carregar resumo da home';
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando resumo..." />;
  }

  if (erro) {
    return <EstadoErro mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregarResumo} />;
  }

  const proximoServico = resumo.proximoAgendamento?.servico || 'Sem serviço para hoje';
  const proximoHorario = obterHoraProximoAgendamento(resumo.proximoAgendamento);
  const clienteNome = resumo.proximoAgendamento?.clienteNome || 'Sem cliente';
  const veiculoDescricao = resumo.proximoAgendamento?.veiculoDescricao || 'Sem veículo';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-100">
      <View className="items-center px-5 pt-4 pb-4" style={{ backgroundColor: '#B30000' }}>
        <Text className="text-2xl font-semibold text-white leading-none">Bem vindo,</Text>
        <Text className="mt-1 text-xl font-medium text-white leading-tight">
          {user?.nome || 'Gerente'}!
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <CardLargo texto={`${resumo.agendamentosHoje} Agendamentos hoje`} icone="calendar" />

        <View className="flex-row gap-4 mb-6">
          <CardMedio
            valor={formatarPreco(resumo.faturamentoEstimadoHoje)}
            label="Faturamento estimado hoje"
            icone="trending-up"
          />
          <CardMedio
            valor={formatarPreco(resumo.ticketMedioEstimadoHoje)}
            label="Ticket médio estimado"
            icone="stats-chart"
          />
        </View>

        <CardLargo texto={proximoServico} icone="star" />

        <View className="flex-row gap-4 mb-6">
          <CardMedio valor={proximoHorario} label="Próximo horário" icone="time" />
          <CardMedio valor={clienteNome} label={`Cliente - ${veiculoDescricao}`} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
