// Interface preparada para reconhecimento de voz (Speech-to-Text) no
// assistente. Nenhum pacote de STT está instalado no projeto hoje
// (@react-native-voice/voice, expo-speech-recognition, etc.) e esses módulos
// exigem código nativo — ou seja, um dev client / build EAS — o que não
// funciona no Expo Go puro usado atualmente para desenvolvimento. Por isso
// esta primeira versão expõe a mesma interface que uma implementação real
// teria, mas com `suportado: false`, para o botão de microfone da tela do
// assistente já existir sem quebrar nada quando a gravação for implementada.
export type UseVoiceInputResult = {
  suportado: boolean;
  gravando: boolean;
  iniciar: () => Promise<void>;
  parar: () => Promise<void>;
};

export function useVoiceInput(): UseVoiceInputResult {
  return {
    suportado: false,
    gravando: false,
    async iniciar() {
      // Sem-op: aguardando implementação nativa (dev client/EAS).
    },
    async parar() {
      // Sem-op: aguardando implementação nativa (dev client/EAS).
    },
  };
}
