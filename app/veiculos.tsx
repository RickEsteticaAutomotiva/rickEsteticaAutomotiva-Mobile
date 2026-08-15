import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { VeiculoCard } from '@/components/VeiculoCard';
import { VeiculoFormModal } from '@/components/VeiculoFormModal';
import { useVeiculos } from '@/hooks/useVeiculos';

export default function Veiculos() {
  const {
    veiculos,
    loading,
    erro,
    carregarVeiculos,
    modalFormVisible,
    veiculoEditando,
    salvandoForm,
    erroForm,
    abrirAdicao,
    abrirEdicao,
    fecharForm,
    handleSubmitForm,
    veiculoRemovendo,
    removendo,
    erroRemocao,
    abrirConfirmacaoRemocao,
    fecharConfirmacaoRemocao,
    handleConfirmarRemocao,
  } = useVeiculos();

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando veículos..." />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#f7f7f7' }}>
      <ScrollView className="flex-1 px-3 pt-5" contentContainerStyle={{ paddingBottom: 24 }}>
        {erro ? (
          <Alerta
            mensagem={erro}
            className="mb-4"
            acaoTexto="Tentar novamente"
            onAcao={carregarVeiculos}
          />
        ) : null}

        {!erro && veiculos.length === 0 ? (
          <View className="items-center rounded-lg border border-gray-200 bg-white px-4 py-10">
            <Ionicons name="car-outline" size={32} color="#a0a0a0" />
            <Text className="mt-3 text-center text-base text-gray-600">
              Você ainda não possui veículos.
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500">
              Adicione seu primeiro veículo para poder realizar agendamentos.
            </Text>
          </View>
        ) : (
          veiculos.map((veiculo) => (
            <VeiculoCard
              key={String(veiculo.id)}
              veiculo={veiculo}
              onEditar={() => abrirEdicao(veiculo)}
              onRemover={() => abrirConfirmacaoRemocao(veiculo)}
            />
          ))
        )}

        <Button
          texto="+ Adicionar veículo"
          onClick={abrirAdicao}
          className="mt-3 bg-white border border-gray-300"
          textClassName="text-gray-900"
        />
      </ScrollView>

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
