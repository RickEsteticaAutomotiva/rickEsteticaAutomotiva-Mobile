import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { servicosService } from '../../services/ServicosService';
import { Mapa } from '../../components/Mapa';
import { Button } from '../../components/Button';

export default function Servico() {
  const { servicoId } = useLocalSearchParams<{
    servicoId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [servico, setServico] = useState<Record<string, unknown> | null>(null);

  const carregarServico = useCallback(async () => {
    if (!servicoId) {
      setErro('Serviço inválido.');
      setLoading(false);
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      const response = await servicosService.buscarPorId(servicoId);

      setServico(response as Record<string, unknown>);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o serviço.';

      setErro(mensagem);
      setServico(null);
    } finally {
      setLoading(false);
    }
  }, [servicoId]);

  useEffect(() => {
    carregarServico();
  }, [carregarServico]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#B30000" />

        <Text className="mt-3 text-base text-gray-700">
          Carregando serviço...
        </Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-base text-red-600">
          {erro}
        </Text>
      </View>
    );
  }

  const nome = String(
    servico?.nome ||
    servico?.name ||
    'Serviço'
  );

  const descricao = String(
    servico?.descricao ||
    servico?.description ||
    ''
  );

  const preco = servico?.preco
    ? `R$ ${String(servico.preco)}`
    : null;

  const imagem = String(
    servico?.imagem || ''
  );

  return (
    <ScrollView className="flex-1 bg-white">
        <View className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
            <Image
                source={{
                uri:
                    imagem ||
                    'https://www.setup.gg/wp-content/uploads/2024/06/sacy-featured-image-e1719282126561.jpg',
                }}
                className="h-full w-full"
                resizeMode="cover"
            />

            <Pressable
                onPress={() => router.back()}
                className="absolute left-4 top-12 z-50 h-10 w-10 items-center justify-center rounded-full bg-white/80"
                >
                <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
        </View>

      <View className="px-5">

        {/* Nome + ações */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {nome}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {}}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-200"
            >
              <Text className="text-base font-semibold text-gray-700">
                <Ionicons name="share-social-outline" size={24} color="#374151" />
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {}}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-200"
            >
              <Text className="text-base font-semibold text-gray-700">
                <Ionicons name="heart-outline" size={24} color="#374151" />
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Preço */}
        <View className="mt-3 w-full rounded-lg bg-gray-100 p-4">
          <Text className="text-sm text-gray-500">
            A partir de:
          </Text>

          <Text className="mt-2 text-[25px] font-bold text-green-700">
            {preco}
          </Text>
        </View>

        {/* Botões */}
        <Button
          texto="Adicionar ao Carrinho"
          onClick={() => {}}
          className="mt-4 bg-red-700"
          textClassName="text-white"
        />

        <Button
          texto="Agendar Serviço"
          onClick={() => {}}
          className="mt-4 border border-green-700"
          textClassName="text-green-700"
        />

        {/* Descrição */}
        <View className="mt-4 w-full border-y border-gray-200 py-4">
          <Text className="text-lg font-bold text-gray-900">
            Descrição
          </Text>

          <Text className="mt-3 text-base text-gray-700">
            {descricao}
          </Text>
        </View>

        {/* Localização */}
        <View className="w-full border-b border-gray-200 py-4">
          <Text className="text-lg font-bold text-gray-900">
            Localização
          </Text>

          <Text className="mt-3 text-base font-semibold text-gray-700">
            Rick Estética Automotiva
          </Text>

          <Text className="mb-4 mt-3 text-base text-gray-700">
            R. Alcatifa, 81 - Jardim Brasilia (Zona Leste),
            São Paulo, 03583-030
          </Text>

          <Mapa />
        </View>

        {/* Sobre o local */}
        <View className="w-full py-4">
          <Text className="text-lg font-bold text-gray-900">
            Sobre o local
          </Text>

          <Text className="mt-3 text-base text-gray-700">
            Estamos localizados na R. Alcatifa, a oficina Rick
            Estética Automotiva é referência em cuidados
            automotivos, oferecendo serviços especializados que
            vão desde lavagens técnicas até vitrificação e
            revitalização completa de veículos. Nosso objetivo é
            proporcionar não apenas limpeza, mas também proteção,
            valorização e durabilidade para cada carro que passa
            por aqui.
          </Text>

          <Image
            source={require('../../assets/local.png')}
            className="mt-4 h-[192px] w-full rounded-lg"
            resizeMode="cover"
          />
        </View>

      </View>
    </ScrollView>
  );
}