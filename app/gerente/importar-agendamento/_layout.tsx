import { Stack } from 'expo-router';
import { ImportacaoAgendamentoProvider } from '@/hooks/useImportacaoAgendamento';

export default function ImportarAgendamentoLayout() {
  return (
    <ImportacaoAgendamentoProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#B30000' },
          headerTitleStyle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
          headerTitleAlign: 'center',
          headerTintColor: '#FFFFFF',
        }}
      >
        <Stack.Screen name="index" options={{ headerTitle: 'Importar agendamento' }} />
        <Stack.Screen name="revisao" options={{ headerTitle: 'Revisar importação' }} />
      </Stack>
    </ImportacaoAgendamentoProvider>
  );
}
