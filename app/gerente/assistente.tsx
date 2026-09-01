import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppointmentSummary } from '@/components/AppointmentSummary';
import { AssistantMessage } from '@/components/AssistantMessage';
import { AssistantTypingIndicator } from '@/components/AssistantTypingIndicator';
import { Input } from '@/components/Input';
import { UserMessage } from '@/components/UserMessage';
import { useAssistente } from '../../hooks/useAssistente';
import { useVoiceInput } from '../../hooks/useVoiceInput';

export default function Assistente() {
  const {
    mensagens,
    enviando,
    enviarMensagem,
    resumoPendente,
    cancelarResumo,
    confirmarAgendamento,
    confirmando,
    erroConfirmacao,
    audioAtivo,
    alternarAudio,
  } = useAssistente();
  const { suportado: vozSuportada } = useVoiceInput();

  const [texto, setTexto] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  function handleEnviar() {
    if (!texto.trim() || enviando) {
      return;
    }
    enviarMensagem(texto);
    setTexto('');
  }

  function handleMicrofone() {
    Alert.alert(
      'Reconhecimento de voz',
      vozSuportada
        ? 'Toque para falar com o assistente.'
        : 'O reconhecimento de voz exige um app nativo (dev client/EAS) e ainda não está disponível no Expo Go. Em breve!'
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {mensagens.map((mensagem) =>
            mensagem.autor === 'usuario' ? (
              <UserMessage key={mensagem.id} texto={mensagem.texto} />
            ) : (
              <AssistantMessage key={mensagem.id} texto={mensagem.texto} erro={mensagem.tipo === 'erro'} />
            )
          )}

          {enviando ? <AssistantTypingIndicator /> : null}

          {resumoPendente ? (
            <AppointmentSummary
              resumo={resumoPendente}
              onConfirmar={confirmarAgendamento}
              onAlterar={cancelarResumo}
              confirmando={confirmando}
              erro={erroConfirmacao}
            />
          ) : null}

          <View className="h-4" />
        </ScrollView>

        <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
          <View className="flex-1 mr-2">
            <Input placeholder="Digite uma mensagem..." value={texto} onChangeText={setTexto} />
          </View>

          <Pressable onPress={alternarAudio} hitSlop={8} className="mr-2">
            <Ionicons name={audioAtivo ? 'volume-high' : 'volume-mute'} size={24} color="#B30000" />
          </Pressable>

          <Pressable onPress={handleMicrofone} hitSlop={8} className="mr-2 opacity-50">
            <Ionicons name="mic" size={26} color="#B30000" />
          </Pressable>

          <Pressable
            onPress={handleEnviar}
            disabled={enviando || !texto.trim()}
            hitSlop={8}
            className="w-11 h-11 rounded-full items-center justify-center active:opacity-70"
            style={{ backgroundColor: '#B30000', opacity: enviando || !texto.trim() ? 0.6 : 1 }}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
