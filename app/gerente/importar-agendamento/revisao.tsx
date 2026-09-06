import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { CampoTexto } from '@/components/CampoTexto';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useImportacaoAgendamento } from '@/hooks/useImportacaoAgendamento';
import { formatarPreco } from '@/utils';

type NivelConfianca = 'alta' | 'media' | 'baixa' | 'nenhuma';

function nivelConfianca(confianca: number | null): NivelConfianca {
  if (confianca === null) return 'nenhuma';
  if (confianca >= 0.85) return 'alta';
  if (confianca >= 0.6) return 'media';
  return 'baixa';
}

const ESTILO_CONFIANCA: Record<NivelConfianca, { texto: string; cor: string }> = {
  alta: { texto: '✓ Alta confiança', cor: '#15803d' },
  media: { texto: '⚠ Confirme este dado', cor: '#b45309' },
  baixa: { texto: '⚠ Baixa confiança — confira', cor: '#b45309' },
  nenhuma: { texto: 'Não identificado — preencha manualmente', cor: '#9CA3AF' },
};

function SeloConfianca({ confianca }: { confianca: number | null }) {
  const estilo = ESTILO_CONFIANCA[nivelConfianca(confianca)];
  return <Text style={{ color: estilo.cor }} className="mt-0.5 text-xs font-medium">{estilo.texto}</Text>;
}

export default function RevisaoImportacaoAgendamento() {
  const {
    dados,
    selecao,
    candidatosPessoaExtras,
    candidatosVeiculoExtras,
    candidatosServicoExtras,
    buscandoCliente,
    buscandoVeiculo,
    buscandoServico,
    criando,
    erroCriar,
    ordemCriada,
    resetar,
    buscarClientes,
    buscarVeiculos,
    buscarVeiculosDoCliente,
    buscarServicosCatalogo,
    selecionarCliente,
    selecionarVeiculo,
    alternarServico,
    atualizarCampo,
    confirmarCriacaoOS,
  } = useImportacaoAgendamento();

  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [termoBuscaCliente, setTermoBuscaCliente] = useState('');
  const [termoBuscaVeiculo, setTermoBuscaVeiculo] = useState('');
  const [termoBuscaServico, setTermoBuscaServico] = useState('');

  useEffect(() => {
    if (!dados) {
      router.replace('/gerente/importar-agendamento');
    }
  }, [dados]);

  if (!dados) {
    return null;
  }

  const candidatosPessoa = [...dados.candidatosPessoa, ...candidatosPessoaExtras].filter(
    (pessoa, index, lista) => lista.findIndex((p) => p.id === pessoa.id) === index
  );
  const candidatosVeiculo = [...dados.candidatosVeiculo, ...candidatosVeiculoExtras].filter(
    (veiculo, index, lista) => lista.findIndex((v) => v.id === veiculo.id) === index
  );

  async function handleConfirmar() {
    const resultado = await confirmarCriacaoOS();
    if (!resultado.sucesso && resultado.erros) {
      setErrosCampos(resultado.erros);
    }
  }

  function handleCancelarConfirmado() {
    resetar();
    setConfirmandoCancelamento(false);
    router.replace('/gerente/mais');
  }

  if (ordemCriada) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="checkmark-circle" size={64} color="#15803d" />
          <Text className="mt-4 text-xl font-bold text-gray-900">Ordem de Serviço criada</Text>

          <View className="mt-4 w-full rounded-lg bg-white p-4 shadow">
            {ordemCriada.cliente ? (
              <Text className="text-sm text-gray-700">Cliente: {ordemCriada.cliente.nome}</Text>
            ) : null}
            {ordemCriada.veiculo ? (
              <Text className="mt-1 text-sm text-gray-700">
                Veículo: {ordemCriada.veiculo.marca} {ordemCriada.veiculo.modelo} — {ordemCriada.veiculo.placa}
              </Text>
            ) : null}
            {ordemCriada.servicos.length > 0 ? (
              <Text className="mt-1 text-sm text-gray-700">
                Serviço{ordemCriada.servicos.length > 1 ? 's' : ''}: {ordemCriada.servicos.map((s) => s.nome).join(', ')}
              </Text>
            ) : null}
            {ordemCriada.dataAgendamento ? (
              <Text className="mt-1 text-sm text-gray-700">Data: {ordemCriada.dataAgendamento}</Text>
            ) : null}
            <Text className="mt-2 text-sm font-semibold text-gray-900">Número da OS: #{ordemCriada.id}</Text>
          </View>

          <View className="mt-6 w-full">
            <Button
              texto="Ver Ordens de Serviço"
              onClick={() => router.replace('/gerente/ordens-servico')}
              className="bg-red-700"
              textClassName="text-white"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {erroCriar ? <Alerta tipo="erro" mensagem={erroCriar} className="mb-3" /> : null}

        {/* Cliente */}
        <View className="rounded-lg bg-white p-4 shadow">
          <Text className="text-base font-bold text-gray-900">Cliente</Text>
          <SeloConfianca confianca={dados.nomeCliente.confianca} />
          {dados.nomeCliente.valor ? (
            <Text className="mt-1 text-sm text-gray-600">Lido da imagem: “{dados.nomeCliente.valor}”</Text>
          ) : null}

          <View className="mt-3 flex-row flex-wrap gap-2">
            {candidatosPessoa.map((pessoa) => {
              const selecionado = selecao.clienteId === pessoa.id;
              return (
                <Pressable
                  key={pessoa.id}
                  onPress={() => {
                    selecionarCliente(pessoa.id);
                    buscarVeiculosDoCliente(pessoa.id);
                  }}
                  className="rounded-full border px-3 py-1.5"
                  style={{ borderColor: selecionado ? '#B30000' : '#d1d5db', backgroundColor: selecionado ? '#FEF2F2' : '#fff' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: selecionado ? '#B30000' : '#374151' }}>
                    {pessoa.nome}
                  </Text>
                </Pressable>
              );
            })}
            {candidatosPessoa.length === 0 ? (
              <Text className="text-sm text-gray-500">Nenhum cliente correspondente encontrado.</Text>
            ) : null}
          </View>

          <View className="mt-3 flex-row items-end gap-2">
            <View className="flex-1">
              <CampoTexto
                label="Buscar cliente"
                semMargemSuperior
                placeholder="Nome do cliente"
                value={termoBuscaCliente}
                onChangeText={setTermoBuscaCliente}
              />
            </View>
            <Button
              texto={buscandoCliente ? '...' : 'Buscar'}
              onClick={() => buscarClientes(termoBuscaCliente)}
              loading={buscandoCliente}
              className="h-12 w-28 bg-gray-700"
              textClassName="text-white text-sm"
            />
          </View>
        </View>

        {/* Veículo */}
        <View className="mt-4 rounded-lg bg-white p-4 shadow">
          <Text className="text-base font-bold text-gray-900">Veículo</Text>
          {errosCampos.veiculo ? <Text className="mt-1 text-sm text-red-600">{errosCampos.veiculo}</Text> : null}
          <SeloConfianca confianca={dados.placaVeiculo.confianca ?? dados.modeloVeiculo.confianca} />
          {(dados.placaVeiculo.valor || dados.modeloVeiculo.valor) ? (
            <Text className="mt-1 text-sm text-gray-600">
              Lido da imagem: “{[dados.modeloVeiculo.valor, dados.placaVeiculo.valor].filter(Boolean).join(' — ')}”
            </Text>
          ) : null}

          <View className="mt-3 flex-row flex-wrap gap-2">
            {candidatosVeiculo.map((veiculo) => {
              const selecionado = selecao.veiculoId === veiculo.id;
              return (
                <Pressable
                  key={veiculo.id}
                  onPress={() => selecionarVeiculo(veiculo.id)}
                  className="rounded-full border px-3 py-1.5"
                  style={{ borderColor: selecionado ? '#B30000' : '#d1d5db', backgroundColor: selecionado ? '#FEF2F2' : '#fff' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: selecionado ? '#B30000' : '#374151' }}>
                    {veiculo.marca} {veiculo.modelo} — {veiculo.placa}
                  </Text>
                </Pressable>
              );
            })}
            {candidatosVeiculo.length === 0 ? (
              <Text className="text-sm text-gray-500">Nenhum veículo correspondente encontrado.</Text>
            ) : null}
          </View>

          <View className="mt-3 flex-row items-end gap-2">
            <View className="flex-1">
              <CampoTexto
                label="Buscar veículo"
                semMargemSuperior
                placeholder="Placa ou modelo"
                value={termoBuscaVeiculo}
                onChangeText={setTermoBuscaVeiculo}
              />
            </View>
            <Button
              texto={buscandoVeiculo ? '...' : 'Buscar'}
              onClick={() => buscarVeiculos(termoBuscaVeiculo)}
              loading={buscandoVeiculo}
              className="h-12 w-28 bg-gray-700"
              textClassName="text-white text-sm"
            />
          </View>
        </View>

        {/* Serviços */}
        <View className="mt-4 rounded-lg bg-white p-4 shadow">
          <Text className="text-base font-bold text-gray-900">
            Serviços {selecao.servicosIds.length > 0 ? `(${selecao.servicosIds.length})` : ''}
          </Text>
          {errosCampos.servicos ? <Text className="mt-1 text-sm text-red-600">{errosCampos.servicos}</Text> : null}
          <SeloConfianca confianca={dados.descricaoServico.confianca} />
          {dados.descricaoServico.valor ? (
            <Text className="mt-1 text-sm text-gray-600">Lido da imagem: “{dados.descricaoServico.valor}”</Text>
          ) : null}

          <View className="mt-3">
            {candidatosServicoExtras.map((servico) => {
              const selecionado = selecao.servicosIds.includes(servico.id);
              return (
                <Pressable
                  key={servico.id}
                  onPress={() => alternarServico(servico.id)}
                  className="mb-2 flex-row items-center justify-between rounded-lg border px-4 py-3"
                  style={{ borderColor: selecionado ? '#B30000' : '#e5e7eb' }}
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-semibold text-gray-900">{servico.nome}</Text>
                    <Text className="text-xs text-gray-500">{formatarPreco(servico.preco)}</Text>
                  </View>
                  <Ionicons name={selecionado ? 'checkbox' : 'square-outline'} size={22} color={selecionado ? '#B30000' : '#9CA3AF'} />
                </Pressable>
              );
            })}
            {candidatosServicoExtras.length === 0 ? (
              <Text className="text-sm text-gray-500">Nenhum serviço do catálogo correspondente ainda — busque abaixo.</Text>
            ) : null}
          </View>

          <View className="mt-2 flex-row items-end gap-2">
            <View className="flex-1">
              <CampoTexto
                label="Buscar serviço no catálogo"
                semMargemSuperior
                placeholder="Ex: polimento"
                value={termoBuscaServico}
                onChangeText={setTermoBuscaServico}
              />
            </View>
            <Button
              texto={buscandoServico ? '...' : 'Buscar'}
              onClick={() => buscarServicosCatalogo(termoBuscaServico)}
              loading={buscandoServico}
              className="h-12 w-28 bg-gray-700"
              textClassName="text-white text-sm"
            />
          </View>
        </View>

        {/* Data, horário, valor */}
        <View className="mt-4 rounded-lg bg-white p-4 shadow">
          <Text className="text-base font-bold text-gray-900">Data e horário</Text>

          <CampoTexto
            label="Data"
            placeholder="DD/MM/AAAA"
            value={selecao.data}
            onChangeText={(texto) => atualizarCampo('data', texto)}
            keyboardType="numeric"
            error={errosCampos.data}
          />
          <SeloConfianca confianca={dados.data.confianca} />

          <CampoTexto
            label="Horário"
            placeholder="HH:MM"
            value={selecao.hora}
            onChangeText={(texto) => atualizarCampo('hora', texto)}
            keyboardType="numeric"
            error={errosCampos.hora}
          />
          <SeloConfianca confianca={dados.horario.confianca} />

          <CampoTexto
            label="Valor (opcional)"
            placeholder="R$"
            value={selecao.valor}
            onChangeText={(texto) => atualizarCampo('valor', texto)}
            keyboardType="numeric"
          />
          <SeloConfianca confianca={dados.valor.confianca} />

          <CampoTexto
            label="Observações"
            placeholder="Observações adicionais"
            value={selecao.observacoes}
            onChangeText={(texto) => atualizarCampo('observacoes', texto)}
            multiline
          />
        </View>

        <View className="mt-5 flex-row gap-3">
          <Pressable
            className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300"
            onPress={() => setConfirmandoCancelamento(true)}
            disabled={criando}
          >
            <Text className="text-lg font-semibold text-gray-700">Cancelar</Text>
          </Pressable>

          <Button
            texto="Criar Ordem de Serviço"
            onClick={handleConfirmar}
            loading={criando}
            className="flex-1 bg-red-700"
            textClassName="text-white"
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirmandoCancelamento}
        title="Cancelar importação?"
        message="Nenhuma Ordem de Serviço será criada e os dados desta importação serão descartados."
        confirmText="Cancelar importação"
        cancelText="Voltar"
        onConfirm={handleCancelarConfirmado}
        onCancel={() => setConfirmandoCancelamento(false)}
      />
    </SafeAreaView>
  );
}
