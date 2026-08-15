import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Alerta } from '../../components/Alerta';
import { CarrinhoBottom } from '../../components/CarrinhoBottom';
import { EstadoCarregamento } from '../../components/EstadoCarregamento';
import { EstadoErro } from '../../components/EstadoErro';
import { getImagemServico } from '../../constants/imagensServicos';
import { useCarrinho } from '../../context/CarrinhoContext';
import type { ItemCarrinho } from '../../types';
import { formatarPreco } from '../../utils';

export default function Carrinho() {
  const { itens, loading, erro, carregarCarrinho, removerItem } = useCarrinho();
  const [removendoIds, setRemovendoIds] = useState<Set<string | number>>(new Set());
  const [erroRemocao, setErroRemocao] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      carregarCarrinho();
    }, [carregarCarrinho])
  );

  async function handleRemover(idCarrinho: string | number) {
    if (removendoIds.has(idCarrinho)) {
      return;
    }

    setErroRemocao(null);
    setRemovendoIds((atual) => new Set(atual).add(idCarrinho));

    try {
      await removerItem(idCarrinho);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível remover o item.';
      setErroRemocao(mensagem);
    } finally {
      setRemovendoIds((atual) => {
        const novo = new Set(atual);
        novo.delete(idCarrinho);
        return novo;
      });
    }
  }

  if (loading) {
    return <EstadoCarregamento mensagem="Carregando carrinho..." />;
  }

  if (erro) {
    return (
      <EstadoErro mensagem={erro} acaoTexto="Tentar novamente" onAcao={() => carregarCarrinho()} />
    );
  }

  if (itens.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-xl font-bold text-gray-900 text-center">
          Seu carrinho está vazio
        </Text>
        <Text className="mt-2 text-base text-gray-600 text-center">
          Adicione um serviço para começar.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#f7f7f7' }}>
      <ScrollView className="flex-1 px-3 mt-5" contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="items-center justify-center p-2">

          {erroRemocao ? <Alerta mensagem={erroRemocao} className="mb-3 w-full" /> : null}

          {itens.map((item: ItemCarrinho) => {
            const removendo = removendoIds.has(item.idCarrinho);

            return (
              <View
                key={String(item.idCarrinho)}
                className="flex-row justify-between w-full mb-3 p-3 rounded-lg bg-white shadow"
              >
                <Pressable
                  id={`servico-card-${item.idServico}`}
                  onPress={() => {
                    router.push({
                      pathname: '/servicos/[servicoId]',
                      params: {
                        servicoId: String(item.idServico),
                      },
                    });
                  }}
                >
                  <View className="items-center bg-gray-100 rounded-lg h-[80px] w-[80px]">
                    <Image
                      source={getImagemServico(item.nome)}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                    />
                  </View>
                </Pressable>

                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center">
                    <Pressable
                      id={`servico-card-${item.idServico}`}
                      onPress={() => {
                        router.push({
                          pathname: '/servicos/[servicoId]',
                          params: {
                            servicoId: String(item.idServico),
                          },
                        });
                      }}
                    >
                      <Text className="text-base text-gray-900 font-semibold">
                        {item.nome}
                      </Text>
                    </Pressable>

                    <Pressable
                      className="mr-2 flex-row items-start"
                      disabled={removendo}
                      onPress={() => handleRemover(item.idCarrinho)}
                    >
                      {removendo ? (
                        <ActivityIndicator size="small" color="#374151" />
                      ) : (
                        <View className="flex-row items-center">
                          <Ionicons name="trash-outline" size={18} color="#B30000"/>
                        </View>
                      )}
                    </Pressable>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <Text className="text-base text-gray-900">
                      {formatarPreco(item.preco)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

        </View>
      </ScrollView>

      <View className="">
        <CarrinhoBottom />
      </View>
    </View>
  );
}
