import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { VeiculoCard } from '@/components/VeiculoCard';
import { VeiculoFormModal } from '@/components/VeiculoFormModal';
import { useVeiculos } from '@/hooks/useVeiculos';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function VeiculoScreen() {
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<string | number | null>(null);

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
  } = useVeiculos({
    onVeiculoAdicionado: (veiculo) => setVeiculoSelecionadoId(veiculo.id),
    onVeiculoRemovido: (idVeiculo) =>
      setVeiculoSelecionadoId((atual) => (atual === idVeiculo ? null : atual)),
  });

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
      <View className="flex-1 mt-3">

        <View className="w-full border-b border-gray-200 mb-4 items-center justify-center p-1">
          <Text className="text-base text-gray-600 mb-2">
            Selecione o veículo que irá receber o serviço
          </Text>
        </View>

        <View className="items-center justify-center p-3">
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
            {veiculos.map((veiculo) => (
              <VeiculoCard
                key={String(veiculo.id)}
                veiculo={veiculo}
                selecionado={veiculo.id === veiculoSelecionadoId}
                onPress={() => setVeiculoSelecionadoId(veiculo.id)}
                onEditar={() => abrirEdicao(veiculo)}
                onRemover={() => abrirConfirmacaoRemocao(veiculo)}
              />
            ))}

            <Button
              texto="+ Adicionar veículo"
              onClick={abrirAdicao}
              className="mt-3 bg-white border border-gray-300"
              textClassName="text-gray-900"
            />
          </ScrollView>
        </View>

        <View className="w-full px-4 py-4 mt-4 absolute bottom-0 bg-white rounded-t-lg shadow">

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
