import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Button } from './Button';
import { Alerta } from './Alerta';
import { formatarDataCompleta, formatarPreco } from '../utils';
import type { ResumoAgendamentoPendente } from '../hooks/useAssistente';

type AppointmentSummaryProps = {
  resumo: ResumoAgendamentoPendente;
  onConfirmar: () => void;
  onAlterar: () => void;
  confirmando: boolean;
  erro?: string | null;
};

export function AppointmentSummary({ resumo, onConfirmar, onAlterar, confirmando, erro }: AppointmentSummaryProps) {
  return (
    <View className="mb-3 rounded-2xl bg-white shadow border border-gray-200 overflow-hidden">
      <View className="px-4 py-3" style={{ backgroundColor: '#B30000' }}>
        <Text className="text-white font-bold text-base">Resumo do agendamento</Text>
      </View>

      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="car-sport" size={18} color="#B30000" />
          <Text className="ml-2 text-gray-900 font-semibold">{resumo.veiculoLabel}</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="construct" size={18} color="#B30000" />
          <Text className="ml-2 text-gray-900">{resumo.servicoNome}</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar" size={18} color="#B30000" />
          <Text className="ml-2 text-gray-900">{formatarDataCompleta(resumo.data)}</Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Ionicons name="time" size={18} color="#B30000" />
          <Text className="ml-2 text-gray-900">{resumo.horario}</Text>
        </View>

        <View className="border-t border-gray-100 pt-3 mb-3">
          <Text className="text-sm text-gray-500">Valor</Text>
          <Text className="text-lg font-bold text-gray-900">{formatarPreco(resumo.precoServico)}</Text>
        </View>

        {erro ? <Alerta tipo="erro" mensagem={erro} /> : null}

        <Button
          texto="Confirmar agendamento"
          onClick={onConfirmar}
          loading={confirmando}
          className="bg-red-700 mb-2"
          textClassName="text-white"
        />
        <Button
          texto="Alterar"
          onClick={onAlterar}
          disabled={confirmando}
          className="bg-white border border-gray-300"
          textClassName="text-gray-900"
        />
      </View>
    </View>
  );
}
