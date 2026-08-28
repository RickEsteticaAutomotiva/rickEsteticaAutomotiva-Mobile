import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { CardServico } from '@/components/gerente/CardServico';
import { ModalServico } from '@/components/gerente/ModalServico';
import { useServicosGerente } from '../../hooks/useServicosGerente';

export default function ServicosGerente() {
  const {
    servicos,
    categorias,
    loading,
    erro,
    carregarDados,
    modalFormVisible,
    servicoEditando,
    salvandoForm,
    erroForm,
    abrirAdicao,
    abrirEdicao,
    fecharForm,
    handleSubmitForm,
    servicoRemovendo,
    removendo,
    erroRemocao,
    abrirConfirmacaoRemocao,
    fecharConfirmacaoRemocao,
    handleConfirmarRemocao,
  } = useServicosGerente();

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando serviços..." />;
  }

  const categoriasPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]));

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 pt-4">
        {erro ? <Alerta tipo="erro" mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregarDados} /> : null}

        {!erro && servicos.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-base text-gray-500">Nenhum serviço cadastrado ainda.</Text>
          </View>
        ) : null}

        {servicos.map((servico) => (
          <CardServico
            key={servico.id}
            servico={servico}
            categoria={servico.categoriaId ? categoriasPorId.get(servico.categoriaId) : undefined}
            onEditar={() => abrirEdicao(servico)}
            onExcluir={() => abrirConfirmacaoRemocao(servico)}
          />
        ))}

        <Button
          texto="+ Novo serviço"
          onClick={abrirAdicao}
          className="mt-2 mb-6 border border-red-700 bg-white"
          textClassName="text-red-700"
        />
      </ScrollView>

      <ModalServico
        visible={modalFormVisible}
        servico={servicoEditando}
        categorias={categorias}
        loading={salvandoForm}
        erro={erroForm}
        onClose={fecharForm}
        onSubmit={handleSubmitForm}
      />

      <ConfirmModal
        visible={servicoRemovendo !== null}
        title="Remover serviço"
        message={`Tem certeza que deseja remover "${servicoRemovendo?.nome}"? Essa ação não pode ser desfeita.`}
        confirmText="Remover"
        loading={removendo}
        erro={erroRemocao}
        onConfirm={handleConfirmarRemocao}
        onCancel={fecharConfirmacaoRemocao}
      />
    </SafeAreaView>
  );
}
