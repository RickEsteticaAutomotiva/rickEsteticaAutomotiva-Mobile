import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfiguracaoItem } from '@/components/ConfiguracaoItem';
import { useAuth } from '../../context/AuthContext';

export default function MaisGerente() {
  const { logout } = useAuth();
  const [saindo, setSaindo] = useState(false);

  async function handleLogout() {
    if (saindo) {
      return;
    }

    setSaindo(true);
    try {
      await logout();
    } finally {
      setSaindo(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="bg-white rounded-lg p-2 shadow mb-4">
          <ConfiguracaoItem
            icone="camera-outline"
            titulo="Importar agendamento"
            subtitulo="Tire uma foto de uma anotação e crie a OS"
            onPress={() => router.push('/gerente/importar-agendamento')}
          />

          <ConfiguracaoItem
            icone="sparkles-outline"
            titulo="Assistente IA"
            subtitulo="Converse com o assistente do Rick"
            onPress={() => router.push('/gerente/assistente')}
          />

          <ConfiguracaoItem
            icone="construct-outline"
            titulo="Gerenciar serviços"
            subtitulo="Cadastre, edite e remova serviços"
            onPress={() => router.push('/gerente/servicos')}
          />

          <ConfiguracaoItem
            icone="pricetags-outline"
            titulo="Gerenciar categorias"
            subtitulo="Organize as categorias de serviço"
            onPress={() => router.push('/gerente/categorias')}
          />

          <ConfiguracaoItem
            icone="person-outline"
            titulo="Perfil"
            subtitulo="Seus dados e senha"
            onPress={() => router.push('/gerente/perfil')}
          />
        </View>

        <Pressable
          onPress={handleLogout}
          disabled={saindo}
          className="h-14 flex-row items-center justify-center rounded-lg border border-red-700"
        >
          {saindo ? (
            <ActivityIndicator color="#B30000" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#B30000" />
              <Text className="ml-2 text-base font-semibold text-red-700">Sair</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
