import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

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
        options={{ href: null, headerTitle: 'Gerenciar serviços' }}
      />

      <Tabs.Screen
        name="categorias"
        options={{ href: null, headerTitle: 'Gerenciar categorias' }}
      />

      <Tabs.Screen
        name="perfil"
        options={{ href: null, headerTitle: 'Perfil' }}
      />

      <Tabs.Screen
        name="assistente"
        options={{ href: null, headerTitle: 'Assistente Rick' }}
      />
    </Tabs>
  );
}
