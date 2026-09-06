import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alerta } from '@/components/Alerta';
import { Button } from '@/components/Button';
import { EstadoCarregamento } from '@/components/EstadoCarregamento';
import { useImportacaoAgendamento } from '@/hooks/useImportacaoAgendamento';

export default function ImportarAgendamento() {
  const { imagem, processando, erroProcessamento, capturarImagem, processarImagem } = useImportacaoAgendamento();

  async function handleCapturar(origem: 'camera' | 'galeria') {
    await capturarImagem(origem);
  }

  async function handleProcessar() {
    const sucesso = await processarImagem();
    if (sucesso) {
      router.push('/gerente/importar-agendamento/revisao');
    }
  }

  if (processando) {
    return <EstadoCarregamento mensagem="Analisando a imagem..." />;
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="rounded-lg bg-white p-4 shadow">
          <Text className="text-lg font-bold text-gray-900">Importar agendamento</Text>
          <Text className="mt-1 text-sm text-gray-600">
            Transforme uma anotação, bilhete ou print de conversa em uma Ordem de Serviço automaticamente. A IA lê a
            imagem e sugere os dados — você revisa e confirma antes de qualquer coisa ser criada.
          </Text>

          {erroProcessamento ? <Alerta tipo="erro" mensagem={erroProcessamento} className="mt-4" /> : null}

          {imagem ? (
            <View className="mt-4 items-center">
              <Image source={{ uri: imagem.uri }} style={{ width: '100%', height: 220, borderRadius: 8 }} contentFit="cover" />
            </View>
          ) : null}

          <View className="mt-5 gap-3">
            <Button
              texto="Tirar foto"
              onClick={() => handleCapturar('camera')}
              className="bg-red-700"
              textClassName="text-white"
            />
            <Button
              texto="Selecionar imagem"
              onClick={() => handleCapturar('galeria')}
              className="border border-red-700"
              textClassName="text-red-700"
            />
          </View>

          {imagem ? (
            <View className="mt-4">
              <Button texto="Processar imagem" onClick={handleProcessar} className="bg-green-700" textClassName="text-white" />
            </View>
          ) : null}
        </View>

        <View className="mt-4 flex-row items-start rounded-lg bg-white p-4 shadow">
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text className="ml-2 flex-1 text-xs text-gray-500">
            A imagem é enviada apenas para leitura pela IA e não fica armazenada no sistema. Nenhuma Ordem de Serviço é
            criada automaticamente — você sempre revisa e confirma os dados antes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
