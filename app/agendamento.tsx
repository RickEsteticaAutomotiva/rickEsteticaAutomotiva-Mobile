import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { EstadoErro } from '@/components/EstadoErro';
import { useAuth } from '../context/AuthContext';
import { useCarrinho } from '../context/CarrinhoContext';
import { veiculoService } from '../services/VeiculoService';
import { ordemServicoService } from '../services/OrdemServicoService';
import { normalizarVeiculos } from '../utils/normalizacao';
import { formatarPreco, formatarDataCompleta } from '../utils';
import type { Veiculo, HorarioDisponivel, ItemCarrinho } from '../types';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type DiaSelecionado = { year: number; month: number; day: number };

function pad(numero: number) {
  return String(numero).padStart(2, '0');
}

function formatarDataIso(data: DiaSelecionado) {
  return `${data.year}-${pad(data.month + 1)}-${pad(data.day)}`;
}

function compararDatas(a: DiaSelecionado, b: DiaSelecionado) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

function gerarDiasDoMes(year: number, month: number): (number | null)[] {
  const primeiroDiaSemana = new Date(year, month, 1).getDay();
  const totalDias = new Date(year, month + 1, 0).getDate();

  const dias: (number | null)[] = [];
  for (let i = 0; i < primeiroDiaSemana; i += 1) {
    dias.push(null);
  }
  for (let dia = 1; dia <= totalDias; dia += 1) {
    dias.push(dia);
  }
  while (dias.length % 7 !== 0) {
    dias.push(null);
  }
  return dias;
}

export default function Agendamento() {
  const { idVeiculo } = useLocalSearchParams<{ idVeiculo?: string }>();
  const { user } = useAuth();
  const { itens, total, carregarCarrinho } = useCarrinho();

  const hoje = new Date();
  const hojeInfo: DiaSelecionado = {
    year: hoje.getFullYear(),
    month: hoje.getMonth(),
    day: hoje.getDate(),
  };

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [loadingVeiculo, setLoadingVeiculo] = useState(true);
  const [erroVeiculo, setErroVeiculo] = useState<string | null>(null);

  const [mesAtual, setMesAtual] = useState({ year: hojeInfo.year, month: hojeInfo.month });
  const [dataSelecionada, setDataSelecionada] = useState<DiaSelecionado | null>(null);

  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [erroHorarios, setErroHorarios] = useState<string | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<HorarioDisponivel | null>(null);

  const [confirmando, setConfirmando] = useState(false);
  const [erroConfirmar, setErroConfirmar] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const carregarVeiculo = useCallback(async () => {
    if (!idVeiculo) {
      setErroVeiculo('Nenhum veículo foi selecionado.');
      setLoadingVeiculo(false);
      return;
    }

    if (!user?.id) {
      setErroVeiculo('Não foi possível identificar o usuário logado.');
      setLoadingVeiculo(false);
      return;
    }

    setLoadingVeiculo(true);
    setErroVeiculo(null);

    try {
      const response = await veiculoService.buscarVeiculosPorUsuario(user.id);
      const veiculos = normalizarVeiculos(response);
      const veiculoEncontrado =
        veiculos.find((item) => String(item.id) === String(idVeiculo)) ?? null;

      if (!veiculoEncontrado) {
        setErroVeiculo('Não foi possível carregar os dados do veículo.');
      }

      setVeiculo(veiculoEncontrado);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível carregar o veículo selecionado.';
      setErroVeiculo(mensagem);
      setVeiculo(null);
    } finally {
      setLoadingVeiculo(false);
    }
  }, [idVeiculo, user?.id]);

  useEffect(() => {
    carregarVeiculo();
  }, [carregarVeiculo]);

  useEffect(() => {
    if (!dataSelecionada || itens.length === 0) {
      setHorarios([]);
      return;
    }

    let cancelado = false;

    (async () => {
      setLoadingHorarios(true);
      setErroHorarios(null);
      setHorarioSelecionado(null);

      try {
        const servicosIds = itens.map((item: ItemCarrinho) => item.idServico);
        const response = await ordemServicoService.buscarHorariosDisponiveis(
          formatarDataIso(dataSelecionada),
          servicosIds
        );

        if (!cancelado) {
          setHorarios(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        if (!cancelado) {
          const mensagem =
            error instanceof Error ? error.message : 'Não foi possível carregar a disponibilidade.';
          setErroHorarios(mensagem);
          setHorarios([]);
        }
      } finally {
        if (!cancelado) {
          setLoadingHorarios(false);
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [dataSelecionada, itens]);

  function handleMesAnterior() {
    if (mesAtual.year === hojeInfo.year && mesAtual.month === hojeInfo.month) {
      return;
    }
    setMesAtual((atual) => {
      const month = atual.month === 0 ? 11 : atual.month - 1;
      const year = atual.month === 0 ? atual.year - 1 : atual.year;
      return { year, month };
    });
  }

  function handleProximoMes() {
    setMesAtual((atual) => {
      const month = atual.month === 11 ? 0 : atual.month + 1;
      const year = atual.month === 11 ? atual.year + 1 : atual.year;
      return { year, month };
    });
  }

  function handleSelecionarDia(dia: number | null) {
    if (dia === null) {
      return;
    }

    const candidato: DiaSelecionado = { year: mesAtual.year, month: mesAtual.month, day: dia };
    if (compararDatas(candidato, hojeInfo) < 0) {
      return;
    }

    setDataSelecionada(candidato);
  }

  async function handleConfirmar() {
    if (confirmando || !veiculo || itens.length === 0 || !dataSelecionada || !horarioSelecionado) {
      return;
    }

    setConfirmando(true);
    setErroConfirmar(null);

    try {
      const horarioFormatado = horarioSelecionado.inicio.slice(0, 5);
      const payload = {
        dataAgendamento: `${formatarDataIso(dataSelecionada)}T${horarioFormatado}:00`,
        servicos: itens.map((item: ItemCarrinho) => Number(item.idServico)),
        veiculo: Number(veiculo.id),
        precoMinimo: total,
      };

      await ordemServicoService.criarOrdemServico(payload);
      setSucesso(true);
      await carregarCarrinho();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível confirmar o agendamento. Tente novamente.';
      setErroConfirmar(mensagem);
    } finally {
      setConfirmando(false);
    }
  }

  if (loadingVeiculo) {
    return <EstadoCarregamento mensagem="Carregando dados do agendamento..." />;
  }

  if (erroVeiculo || !veiculo) {
    return (
      <EstadoErro
        mensagem={erroVeiculo || 'Não foi possível carregar o veículo selecionado.'}
        acaoTexto="Voltar"
        onAcao={() => router.back()}
      />
    );
  }

  if (sucesso) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="checkmark-circle" size={72} color="#15803d" />
        <Text className="mt-4 text-xl font-bold text-gray-900 text-center">
          Agendamento confirmado!
        </Text>
        <Text className="mt-2 text-base text-gray-600 text-center">
          Seu agendamento foi realizado com sucesso. Você pode acompanhar os detalhes na área de pedidos.
        </Text>
        <Button
          texto="Voltar para o início"
          onClick={() => router.replace('/')}
          className="mt-6 bg-red-700 w-full"
          textClassName="text-white"
        />
      </View>
    );
  }

  const dias = gerarDiasDoMes(mesAtual.year, mesAtual.month);
  const nomeMes = new Date(mesAtual.year, mesAtual.month, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const nomeMesCapitalizado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  const mesAnteriorDesabilitado = mesAtual.year === hojeInfo.year && mesAtual.month === hojeInfo.month;

  const podeConfirmar =
    !confirmando && veiculo !== null && itens.length > 0 && dataSelecionada !== null && horarioSelecionado !== null;

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: '#f7f7f7' }} contentContainerStyle={{ padding: 12, paddingBottom: 32 }}>

      <View className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4">
        <Text className="text-xl font-bold text-gray-900">Escolha a data e horário</Text>
        <Text className="mt-1 text-base text-gray-600">
          Selecione quando deseja receber o serviço
        </Text>

        <View className="mt-5 flex-row items-center justify-between">
          <Pressable
            onPress={handleMesAnterior}
            disabled={mesAnteriorDesabilitado}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ opacity: mesAnteriorDesabilitado ? 0.3 : 1 }}
          >
            <Ionicons name="chevron-back" size={22} color="#374151" />
          </Pressable>

          <Text className="text-base font-semibold text-gray-900">{nomeMesCapitalizado}</Text>

          <Pressable onPress={handleProximoMes} className="h-9 w-9 items-center justify-center rounded-full">
            <Ionicons name="chevron-forward" size={22} color="#374151" />
          </Pressable>
        </View>

        <View className="mt-4 flex-row">
          {DIAS_SEMANA.map((diaSemana) => (
            <View key={diaSemana} className="flex-1 items-center">
              <Text className="text-xs font-semibold text-gray-500">{diaSemana}</Text>
            </View>
          ))}
        </View>

        <View className="mt-2 flex-row flex-wrap">
          {dias.map((dia, indice) => {
            const candidato: DiaSelecionado | null =
              dia !== null ? { year: mesAtual.year, month: mesAtual.month, day: dia } : null;
            const passado = candidato !== null && compararDatas(candidato, hojeInfo) < 0;
            const selecionado =
              candidato !== null &&
              dataSelecionada !== null &&
              compararDatas(candidato, dataSelecionada) === 0;

            return (
              <View key={indice} style={{ width: `${100 / 7}%` }} className="items-center py-1">
                <Pressable
                  disabled={dia === null || passado}
                  onPress={() => handleSelecionarDia(dia)}
                  className="h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: selecionado ? '#B30000' : 'transparent' }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: selecionado ? '#FFFFFF' : passado || dia === null ? '#d1d5db' : '#111827',
                      fontWeight: selecionado ? '700' : '400',
                    }}
                  >
                    {dia ?? ''}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {itens.length === 0 ? (
          <View className="mt-5 rounded-lg bg-amber-100 p-3">
            <Text className="text-sm text-amber-800">
              Nenhum serviço selecionado. Volte ao carrinho para escolher os serviços.
            </Text>
          </View>
        ) : dataSelecionada ? (
          <View className="mt-5">
            <Text className="text-base font-semibold text-gray-900">
              Horários disponíveis para{'\n'}{formatarDataCompleta(
                new Date(dataSelecionada.year, dataSelecionada.month, dataSelecionada.day)
              )}
            </Text>

            {loadingHorarios ? (
              <View className="mt-3 items-center py-4">
                <ActivityIndicator size="small" color="#B30000" />
                <Text className="mt-2 text-sm text-gray-600">Carregando disponibilidade...</Text>
              </View>
            ) : erroHorarios ? (
              <View className="mt-3 rounded-lg bg-red-100 p-3">
                <Text className="text-sm text-red-700">{erroHorarios}</Text>
              </View>
            ) : horarios.length === 0 ? (
              <Text className="mt-3 text-sm text-gray-600">
                Nenhum horário disponível para esta data.
              </Text>
            ) : (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {horarios.map((horario) => {
                  const rotulo = horario.inicio.slice(0, 5);
                  const selecionado = horarioSelecionado?.inicio === horario.inicio;

                  return (
                    <Pressable
                      key={horario.inicio}
                      onPress={() => setHorarioSelecionado(horario)}
                      className="rounded-lg border px-4 py-2"
                      style={{
                        borderColor: selecionado ? '#B30000' : '#d1d5db',
                        backgroundColor: selecionado ? '#B30000' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: selecionado ? '#FFFFFF' : '#111827' }} className="text-sm font-semibold">
                        {rotulo}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}
      </View>

      <View className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-3">Resumo do agendamento</Text>

        <View className="flex-row items-center rounded-lg bg-gray-100 p-3">
          <Ionicons name="car-outline" size={22} color="#1f1f1f" />
          <View className="ml-3">
            <View className="flex-row items-start justify-between">
              <Text className="text-base text-xl text-gray-900 font-semibold">
                {veiculo.marca} {veiculo.modelo}
              </Text>
            </View>

            <View className="flex-row flex-wrap items-center mt-1 gap-3">
              {veiculo.ano ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="calendar-outline" size={16} color="#a0a0a0" />
                  <Text className="text-sm text-gray-900">{veiculo.ano}</Text>
                </View>
              ) : null}

              {veiculo.cor ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="color-palette-outline" size={16} color="#a0a0a0" />
                  <Text className="text-sm text-gray-900">{veiculo.cor}</Text>
                </View>
              ) : null}

              {veiculo.placa ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="card-outline" size={16} color="#a0a0a0" />
                  <Text className="text-sm text-gray-900">{veiculo.placa}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {dataSelecionada && horarioSelecionado ? (
          <View className="flex-row items-center mt-4 rounded-lg bg-yellow-100 p-3">
            <Ionicons name="calendar-outline" size={22} color="#6e5205" />
            <View className="ml-3">
              <Text className="text-base text-xl font-semibold text-yellow-800">
                Data e Horário
              </Text>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-sm font-semibold text-yellow-800">
                  {formatarDataCompleta(new Date(dataSelecionada.year, dataSelecionada.month, dataSelecionada.day))} às {horarioSelecionado.inicio.slice(0, 5)}
                </Text>
              </View>
            </View>
          </View>    
        ) : null}

        <Text className="mt-4 text-base font-semibold text-gray-900">Serviços</Text>
        {itens.length === 0 ? (
          <Text className="mt-1 text-sm text-gray-600">Nenhum serviço selecionado.</Text>
        ) : (
          itens.map((item: ItemCarrinho) => (
            <View key={String(item.idCarrinho)} className="mt-2 flex-row justify-between">
              <Text className="flex-1 text-sm text-gray-800 pr-2">{item.nome}</Text>
              <Text className="text-sm text-gray-900">{formatarPreco(item.preco)}</Text>
            </View>
          ))
        )}

        <View className="mt-4 flex-row justify-between border-t border-gray-200 pt-3">
          <Text className="text-base font-bold text-gray-900">Valor total</Text>
          <Text className="text-base font-bold text-gray-900">{formatarPreco(total)}</Text>
        </View>

        {erroConfirmar ? <Alerta tipo="erro" mensagem={erroConfirmar} className="mt-4" /> : null}

        <Button
          texto="Confirmar Agendamento"
          onClick={handleConfirmar}
          loading={confirmando}
          disabled={!podeConfirmar}
          className="mt-5 bg-red-700 w-full"
          textClassName="text-white"
        />
      </View>
    </ScrollView>
  );
}
