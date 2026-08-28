import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { CardCategoria } from '@/components/gerente/CardCategoria';
import { ModalCategoria } from '@/components/gerente/ModalCategoria';
import { useCategoriasGerente } from '../../hooks/useCategoriasGerente';

export default function CategoriasGerente() {
  const {
    categorias,
    loading,
    erro,
    carregarCategorias,
    modalFormVisible,
    categoriaEditando,
    salvandoForm,
    erroForm,
    abrirAdicao,
    abrirEdicao,
    fecharForm,
    handleSubmitForm,
    categoriaRemovendo,
    removendo,
    erroRemocao,
    abrirConfirmacaoRemocao,
    fecharConfirmacaoRemocao,
    handleConfirmarRemocao,
  } = useCategoriasGerente();

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando categorias..." />;
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 pt-4">
        {erro ? <Alerta tipo="erro" mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregarCategorias} /> : null}

        {!erro && categorias.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-base text-gray-500">Nenhuma categoria cadastrada ainda.</Text>
          </View>
        ) : null}

        {categorias.map((categoria) => (
          <CardCategoria
            key={categoria.id}
            categoria={categoria}
            onEditar={() => abrirEdicao(categoria)}
            onExcluir={() => abrirConfirmacaoRemocao(categoria)}
          />
        ))}

        <Button
          texto="+ Nova categoria"
          onClick={abrirAdicao}
          className="mt-2 mb-6 border border-red-700 bg-white"
          textClassName="text-red-700"
        />
      </ScrollView>

      <ModalCategoria
        visible={modalFormVisible}
        categoria={categoriaEditando}
        loading={salvandoForm}
        erro={erroForm}
        onClose={fecharForm}
        onSubmit={handleSubmitForm}
      />

      <ConfirmModal
        visible={categoriaRemovendo !== null}
        title="Remover categoria"
        message={`Tem certeza que deseja remover "${categoriaRemovendo?.nome}"? Essa ação não pode ser desfeita.`}
        confirmText="Remover"
        loading={removendo}
        erro={erroRemocao}
        onConfirm={handleConfirmarRemocao}
        onCancel={fecharConfirmacaoRemocao}
      />
    </SafeAreaView>
  );
}
