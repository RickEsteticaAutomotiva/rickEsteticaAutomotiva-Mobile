import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

// No SDK 58, href: null bloqueia a tela e redireciona para a primeira aba.
// Ocultamos apenas o botao para manter a navegacao programatica disponivel.
const TELA_SEM_BOTAO = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: 'none' as const },
};

export default function GerenteTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#B30000',
        tabBarInactiveTintColor: '#9CA3AF',
        headerStyle: {
          backgroundColor: '#B30000',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons size={26} name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="agendamento"
        options={{
          title: 'Agenda',
          headerTitle: 'Agendamentos',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="calendar" color={color} />,
        }}
      />

      <Tabs.Screen
        name="ordens-servico"
        options={{
          title: 'Ordens',
          headerTitle: 'Ordens de Serviço',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="document-text" color={color} />,
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="bar-chart" color={color} />,
        }}
      />

      <Tabs.Screen
        name="mais"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="ellipsis-horizontal" color={color} />,
        }}
      />

      <Tabs.Screen
        name="servicos"
        options={{ ...TELA_SEM_BOTAO, headerTitle: 'Gerenciar serviços' }}
      />

      <Tabs.Screen
        name="categorias"
        options={{ ...TELA_SEM_BOTAO, headerTitle: 'Gerenciar categorias' }}
      />

      <Tabs.Screen
        name="perfil"
        options={{ ...TELA_SEM_BOTAO, headerTitle: 'Perfil' }}
      />

      <Tabs.Screen
        name="assistente"
        options={{ ...TELA_SEM_BOTAO, headerTitle: 'Assistente Rick' }}
      />

      <Tabs.Screen
        name="importar-agendamento"
        options={{ ...TELA_SEM_BOTAO, headerShown: false }}
      />
    </Tabs>
  );
}
