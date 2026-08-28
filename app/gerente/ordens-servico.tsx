import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { ModalCriarOrdem } from '@/components/gerente/ModalCriarOrdem';
import { ModalOrdemServico } from '@/components/gerente/ModalOrdemServico';
import { OrdemServicoListItem } from '@/components/gerente/OrdemServicoListItem';
import { STATUS_ORDEM_SERVICO } from '../../constants/statusOrdemServico';
import { useOrdensServicoGerente, type Periodo } from '../../hooks/useOrdensServicoGerente';

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
];

export default function OrdensServicoGerente() {
  const {
    ordens,
    loading,
    erro,
    carregarOrdens,
    pagina,
    setPagina,
    totalPaginas,
    periodo,
    filtroStatus,
    filtroTexto,
    aplicarFiltro,
    ordemSelecionada,
    setOrdemSelecionada,
    handleOrdemAtualizada,
    veiculos,
    servicosDisponiveis,
    modalCriarVisible,
    carregandoDadosCriar,
    criando,
    erroCriar,
    abrirModalCriar,
    fecharModalCriar,
    criarOrdem,
  } = useOrdensServicoGerente();

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <View className="px-4 pt-4">
        <View className="flex-row gap-2">
          {PERIODOS.map((opcao) => {
            const selecionado = periodo === opcao.id;
            return (
              <Pressable
                key={opcao.id}
                onPress={() => aplicarFiltro({ periodo: opcao.id })}
                className="rounded-full border px-3 py-1.5"
                style={{ borderColor: selecionado ? '#B30000' : '#d1d5db', backgroundColor: selecionado ? '#FEF2F2' : '#fff' }}
              >
                <Text className="text-xs font-semibold" style={{ color: selecionado ? '#B30000' : '#374151' }}>
                  {opcao.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-2 flex-row flex-wrap gap-2">
          <Pressable
            onPress={() => aplicarFiltro({ status: null })}
            className="rounded-full border px-3 py-1.5"
            style={{ borderColor: filtroStatus === null ? '#B30000' : '#d1d5db', backgroundColor: filtroStatus === null ? '#FEF2F2' : '#fff' }}
          >
            <Text className="text-xs font-semibold" style={{ color: filtroStatus === null ? '#B30000' : '#374151' }}>
              Todos os status
            </Text>
          </Pressable>
          {STATUS_ORDEM_SERVICO.map((opcao) => {
            const selecionado = filtroStatus === opcao.id;
            return (
              <Pressable
                key={opcao.id}
                onPress={() => aplicarFiltro({ status: opcao.id })}
                className="rounded-full border px-3 py-1.5"
                style={{ borderColor: selecionado ? '#B30000' : '#d1d5db', backgroundColor: selecionado ? opcao.corFundo : '#fff' }}
              >
                <Text className="text-xs font-semibold" style={{ color: selecionado ? opcao.corTexto : '#374151' }}>
                  {opcao.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-3 flex-row items-center rounded-lg border border-gray-300 bg-white px-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Cliente, veículo, serviço ou código da OS"
            value={filtroTexto}
            onChangeText={(texto) => aplicarFiltro({ texto })}
            className="ml-2 flex-1 py-2.5 text-sm text-gray-900"
          />
        </View>
      </View>

      {loading ? (
        <EstadoCarregamento mensagem="Carregando ordens de serviço..." />
      ) : (
        <ScrollView className="flex-1 px-4 pt-3">
          {erro ? <Alerta tipo="erro" mensagem={erro} acaoTexto="Tentar novamente" onAcao={carregarOrdens} /> : null}

          {!erro && ordens.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-base text-gray-500">Nenhuma ordem de serviço encontrada.</Text>
            </View>
          ) : null}

          {ordens.map((ordem) => (
            <OrdemServicoListItem key={ordem.id} ordem={ordem} onPress={() => setOrdemSelecionada(ordem)} />
          ))}

          {totalPaginas > 1 ? (
            <View className="mb-4 flex-row items-center justify-center gap-4">
              <Pressable onPress={() => setPagina((p) => Math.max(0, p - 1))} disabled={pagina === 0} hitSlop={8}>
                <Ionicons name="chevron-back" size={22} color={pagina === 0 ? '#D1D5DB' : '#B30000'} />
              </Pressable>
              <Text className="text-sm text-gray-600">
                Página {pagina + 1} de {totalPaginas}
              </Text>
              <Pressable
                onPress={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                disabled={pagina >= totalPaginas - 1}
                hitSlop={8}
              >
                <Ionicons name="chevron-forward" size={22} color={pagina >= totalPaginas - 1 ? '#D1D5DB' : '#B30000'} />
              </Pressable>
            </View>
          ) : null}

          <Button
            texto="+ Nova ordem de serviço"
            onClick={abrirModalCriar}
            className="mb-6 bg-red-700"
            textClassName="text-white"
          />
        </ScrollView>
      )}

      <ModalOrdemServico
        visible={ordemSelecionada !== null}
        ordemResumo={ordemSelecionada}
        onClose={() => setOrdemSelecionada(null)}
        onOrdemAtualizada={handleOrdemAtualizada}
      />

      <ModalCriarOrdem
        visible={modalCriarVisible}
        veiculos={veiculos}
        servicos={servicosDisponiveis}
        carregandoDados={carregandoDadosCriar}
        loading={criando}
        erro={erroCriar}
        onClose={fecharModalCriar}
        onSubmit={criarOrdem}
      />
    </SafeAreaView>
  );
}
