import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { MOTIVOS_CANCELAMENTO, STATUS_CANCELADO, STATUS_CONCLUIDO, STATUS_ORDEM_SERVICO } from '../../constants/statusOrdemServico';
import { useOrdemServicoDetalhe } from '../../hooks/useOrdemServicoDetalhe';
import type { OrdemServico } from '../../types';
import { formatarDataHorarioCompleto, formatarPreco } from '../../utils';
import { Alerta } from '../Alerta';
import { Button } from '../Button';
import { CampoTexto } from '../CampoTexto';
import { ModalAdicionarServicoOrdem } from './ModalAdicionarServicoOrdem';
import { ModalEditarValorServico } from './ModalEditarValorServico';
import { StatusPill } from './StatusPill';

type ModalOrdemServicoProps = {
  visible: boolean;
  ordemResumo: OrdemServico | null;
  onClose: () => void;
  onOrdemAtualizada?: (ordem: OrdemServico) => void;
};

function extrairDataHora(iso?: string) {
  if (!iso) return { data: '', hora: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { data: '', hora: '' };
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    data: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function montarIso(data: string, hora: string): string | null {
  const partesData = data.split('/');
  const partesHora = hora.split(':');
  if (partesData.length !== 3 || partesHora.length !== 2) return null;

  const [dia, mes, ano] = partesData.map(Number);
  const [horaNum, minuto] = partesHora.map(Number);
  if ([dia, mes, ano, horaNum, minuto].some(Number.isNaN)) return null;

  const d = new Date(ano, mes - 1, dia, horaNum, minuto, 0);
  if (Number.isNaN(d.getTime())) return null;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export function ModalOrdemServico({ visible, ordemResumo, onClose, onOrdemAtualizada }: ModalOrdemServicoProps) {
  if (!visible || !ordemResumo) {
    return null;
  }

  return (
    <ConteudoModalOrdemServico
      ordemResumo={ordemResumo}
      onClose={onClose}
      onOrdemAtualizada={onOrdemAtualizada}
    />
  );
}

function ConteudoModalOrdemServico({
  ordemResumo,
  onClose,
  onOrdemAtualizada,
}: {
  ordemResumo: OrdemServico;
  onClose: () => void;
  onOrdemAtualizada?: (ordem: OrdemServico) => void;
}) {
  const {
    ordem,
    carregandoDetalhe,
    erroDetalhe,
    alterandoStatus,
    erroStatus,
    alterarStatus,
    confirmandoCancelamento,
    motivoCancelamento,
    setMotivoCancelamento,
    salvandoCancelamento,
    erroCancelamento,
    confirmarCancelamento,
    cancelarFluxoCancelamento,
    modalAdicionarVisible,
    setModalAdicionarVisible,
    adicionandoServicos,
    erroAdicionarServicos,
    adicionarServicos,
    servicoEditandoValor,
    setServicoEditandoValor,
    salvandoValorServico,
    erroValorServico,
    salvarValorServico,
    servicoRemovendo,
    setServicoRemovendo,
    removendoServico,
    erroRemoverServico,
    confirmarRemocaoServico,
    salvandoDados,
    erroSalvarDados,
    salvarDados,
  } = useOrdemServicoDetalhe(ordemResumo, onOrdemAtualizada);

  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erroData, setErroData] = useState<string | null>(null);

  useEffect(() => {
    const { data: dataInicial, hora: horaInicial } = extrairDataHora(ordem.dataAgendamento);
    setData(dataInicial);
    setHora(horaInicial);
    setObservacoes(ordem.observacoes ?? '');
  }, [ordem.id, ordem.dataAgendamento, ordem.observacoes]);

  const valorTotal = ordem.servicos.reduce((soma, item) => soma + (Number(item.preco) || 0), 0) || ordem.precoTotal;
  const statusBloqueiaVoltar = ordem.status.id === STATUS_CONCLUIDO || Boolean(ordem.dataConclusao);
  const telefoneDigits = ordem.cliente?.telefone?.replace(/\D/g, '');

  function handleSalvarDados() {
    setErroData(null);
    const iso = montarIso(data, hora);
    if (!iso) {
      setErroData('Informe uma data e horário válidos');
      return;
    }
    salvarDados({ dataAgendamento: iso, observacoes });
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View className="max-h-[90%] w-full rounded-lg bg-white p-5 shadow">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">OS #{ordem.id}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          {carregandoDetalhe ? (
            <View className="py-2">
              <ActivityIndicator color="#B30000" />
            </View>
          ) : null}
          {erroDetalhe ? <Alerta tipo="erro" mensagem={erroDetalhe} className="mt-2" /> : null}

          <ScrollView className="mt-3" showsVerticalScrollIndicator={false}>
            <Text className="text-xs font-semibold uppercase text-gray-400">Cliente</Text>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-base text-gray-900">{ordem.cliente?.nome || 'Não informado'}</Text>
              {telefoneDigits ? (
                <Pressable onPress={() => Linking.openURL(`https://wa.me/55${telefoneDigits}`)} hitSlop={8}>
                  <Ionicons name="logo-whatsapp" size={22} color="#22C55E" />
                </Pressable>
              ) : null}
            </View>

            <Text className="mt-4 text-xs font-semibold uppercase text-gray-400">Veículo</Text>
            <Text className="mt-1 text-base text-gray-900">
              {ordem.veiculo ? `${ordem.veiculo.marca} ${ordem.veiculo.modelo} — ${ordem.veiculo.placa}` : 'Não informado'}
            </Text>

            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase text-gray-400">Serviços</Text>
              <Pressable onPress={() => setModalAdicionarVisible(true)} className="flex-row items-center gap-1">
                <Ionicons name="add-circle-outline" size={18} color="#B30000" />
                <Text className="text-sm font-semibold text-red-700">Adicionar</Text>
              </Pressable>
            </View>

            {erroAdicionarServicos ? <Alerta tipo="erro" mensagem={erroAdicionarServicos} className="mt-2" /> : null}

            {ordem.servicos.length === 0 ? (
              <Text className="mt-2 text-sm text-gray-500">Nenhum serviço nesta ordem.</Text>
            ) : (
              ordem.servicos.map((servico) => (
                <View
                  key={servico.id}
                  className="mt-2 flex-row items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-medium text-gray-900">{servico.nome}</Text>
                    <Text className="text-xs text-gray-500">{formatarPreco(servico.preco)}</Text>
                  </View>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setServicoEditandoValor({ id: servico.id, nome: servico.nome })}
                      hitSlop={8}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#374151" />
                    </Pressable>
                    <Pressable onPress={() => setServicoRemovendo({ id: servico.id, nome: servico.nome })} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color="#B30000" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3">
              <Text className="text-base font-semibold text-gray-900">Valor total</Text>
              <Text className="text-lg font-bold text-green-700">{formatarPreco(valorTotal)}</Text>
            </View>

            <Text className="mt-4 text-xs font-semibold uppercase text-gray-400">Status</Text>
            {erroStatus ? <Alerta tipo="erro" mensagem={erroStatus} className="mt-2" /> : null}

            {!confirmandoCancelamento ? (
              <View className="mt-2 flex-row flex-wrap gap-2">
                {STATUS_ORDEM_SERVICO.map((opcao) => {
                  const selecionado = ordem.status.id === opcao.id;
                  const bloqueado = statusBloqueiaVoltar && opcao.id !== STATUS_CONCLUIDO && opcao.id !== STATUS_CANCELADO;
                  return (
                    <Pressable
                      key={opcao.id}
                      disabled={alterandoStatus || bloqueado}
                      onPress={() => alterarStatus(opcao.id)}
                      className="rounded-full border px-3 py-1.5"
                      style={{
                        borderColor: selecionado ? '#B30000' : '#d1d5db',
                        backgroundColor: selecionado ? opcao.corFundo : '#FFFFFF',
                        opacity: bloqueado ? 0.4 : 1,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: selecionado ? opcao.corTexto : '#374151' }}
                      >
                        {opcao.label}
                      </Text>
                    </Pressable>
                  );
                })}
                {alterandoStatus ? <ActivityIndicator size="small" color="#B30000" /> : null}
              </View>
            ) : (
              <View className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <Text className="text-sm font-semibold text-gray-900">Motivo do cancelamento</Text>
                {erroCancelamento ? <Alerta tipo="erro" mensagem={erroCancelamento} className="mt-2" /> : null}
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {MOTIVOS_CANCELAMENTO.map((motivo) => {
                    const selecionado = motivoCancelamento === motivo.id;
                    return (
                      <Pressable
                        key={motivo.id}
                        onPress={() => setMotivoCancelamento(motivo.id)}
                        className="rounded-full border px-3 py-1.5"
                        style={{
                          borderColor: selecionado ? '#B30000' : '#d1d5db',
                          backgroundColor: selecionado ? '#FEE2E2' : '#FFFFFF',
                        }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: selecionado ? '#B91C1C' : '#374151' }}>
                          {motivo.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    onPress={cancelarFluxoCancelamento}
                    disabled={salvandoCancelamento}
                    className="h-11 flex-1 items-center justify-center rounded-lg border border-gray-300"
                  >
                    <Text className="text-sm font-semibold text-gray-700">Voltar</Text>
                  </Pressable>
                  <Button
                    texto="Confirmar cancelamento"
                    onClick={confirmarCancelamento}
                    loading={salvandoCancelamento}
                    disabled={motivoCancelamento === null}
                    className="h-11 flex-1 bg-red-700"
                    textClassName="text-white text-sm"
                  />
                </View>
              </View>
            )}

            <CampoTexto
              label="Data do agendamento"
              placeholder="DD/MM/AAAA"
              value={data}
              onChangeText={setData}
              keyboardType="numeric"
              editable={!salvandoDados}
            />

            <CampoTexto
              label="Horário"
              placeholder="HH:MM"
              value={hora}
              onChangeText={setHora}
              keyboardType="numeric"
              editable={!salvandoDados}
              error={erroData ?? undefined}
            />

            {ordem.dataConclusao ? (
              <>
                <Text className="mb-1 mt-4 text-base font-semibold text-gray-900">Conclusão</Text>
                <Text className="text-sm text-gray-600">{formatarDataHorarioCompleto(ordem.dataConclusao)}</Text>
              </>
            ) : null}

            <CampoTexto
              label="Observações"
              placeholder="Observações sobre esta ordem"
              value={observacoes}
              onChangeText={setObservacoes}
              editable={!salvandoDados}
              multiline
              numberOfLines={3}
            />

            {erroSalvarDados ? <Alerta tipo="erro" mensagem={erroSalvarDados} className="mt-2" /> : null}

            <Button
              texto="Salvar alterações"
              onClick={handleSalvarDados}
              loading={salvandoDados}
              className="mt-4 mb-2 bg-red-700"
              textClassName="text-white"
            />
          </ScrollView>
        </View>
      </View>

      <ModalAdicionarServicoOrdem
        visible={modalAdicionarVisible}
        servicosJaNaOrdem={ordem.servicos}
        loading={adicionandoServicos}
        erro={erroAdicionarServicos}
        onClose={() => setModalAdicionarVisible(false)}
        onConfirmar={adicionarServicos}
      />

      <ModalEditarValorServico
        visible={servicoEditandoValor !== null}
        nomeServico={servicoEditandoValor?.nome}
        valorAtual={ordem.servicos.find((s) => s.id === servicoEditandoValor?.id)?.preco}
        loading={salvandoValorServico}
        erro={erroValorServico}
        onClose={() => setServicoEditandoValor(null)}
        onSubmit={salvarValorServico}
      />

      <Modal visible={servicoRemovendo !== null} transparent animationType="fade" onRequestClose={() => setServicoRemovendo(null)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-lg bg-white p-5 shadow">
            <Text className="text-xl font-bold text-gray-900">Remover serviço</Text>
            <Text className="mt-2 text-base text-gray-600">
              Tem certeza que deseja remover &quot;{servicoRemovendo?.nome}&quot; desta ordem?
            </Text>
            {erroRemoverServico ? <Alerta tipo="erro" mensagem={erroRemoverServico} className="mt-3" /> : null}
            <View className="mt-5 flex-row gap-3">
              <Pressable
                className="h-14 flex-1 items-center justify-center rounded-lg border border-gray-300"
                onPress={() => setServicoRemovendo(null)}
                disabled={removendoServico}
              >
                <Text className="text-lg font-semibold text-gray-700">Cancelar</Text>
              </Pressable>
              <Button
                texto="Remover"
                onClick={confirmarRemocaoServico}
                loading={removendoServico}
                className="flex-1 bg-red-700"
                textClassName="text-white"
              />
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
