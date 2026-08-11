import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Alerta } from '../../components/Alerta';
import { CarrinhoBottom } from '../../components/CarrinhoBottom';
import { EstadoCarregamento } from '../../components/EstadoCarregamento';
import { EstadoErro } from '../../components/EstadoErro';
import { useCarrinho } from '../../context/CarrinhoContext';
import { formatarPreco } from '../../utils';
import { IMAGEM_PLACEHOLDER } from '../../constants/imagens';
import type { ItemCarrinho } from '../../types';
import { router } from 'expo-router';

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
      <ScrollView className="flex-1 px-1 mt-5" contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="items-center justify-center bg-white p-5 rounded-lg shadow-md border border-gray-200">

          <View className="w-full border-b border-gray-200 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Carrinho de serviços
            </Text>

            <View className="flex-row justify-between w-full ">
              <Text className="text-base text-gray-600 mb-2">
                Serviço
              </Text>

              <Text className="text-base text-gray-600 mb-2">
                A partir de
              </Text>
            </View>
          </View>

          {erroRemocao ? <Alerta mensagem={erroRemocao} className="mb-3 w-full" /> : null}

          {itens.map((item: ItemCarrinho) => {
            const removendo = removendoIds.has(item.idCarrinho);

            return (
              <View
                key={String(item.idCarrinho)}
                className="flex-row justify-between w-full mb-2 border-b border-gray-200 pb-2"
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
                  <View className="items-center bg-gray-100 rounded-lg h-[60px] w-[60px]">
                    <Image
                      source={{ uri: item.imagem || IMAGEM_PLACEHOLDER }}
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

                    <Text className="text-base text-gray-900">
                      {formatarPreco(item.preco)}
                    </Text>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <Pressable
                      className="mr-2 flex-row items-start"
                      disabled={removendo}
                      onPress={() => handleRemover(item.idCarrinho)}
                    >
                      {removendo ? (
                        <ActivityIndicator size="small" color="#374151" />
                      ) : (
                        <View className="flex-row items-center">
                          <Ionicons name="trash-outline" size={20} color="#B30000"/>
                          <Text className="text-red-900 ml-2">Remover do carrinho</Text>
                        </View>
                      )}
                    </Pressable>
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
