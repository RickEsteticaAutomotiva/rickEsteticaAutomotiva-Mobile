import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CarrinhoProvider } from '../context/CarrinhoContext';
import { FavoritosProvider } from '../context/FavoritosContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Navegação (Home, Categoria, detalhe de serviço) fica liberada sem login;
// apenas telas cujo conteúdo depende do usuário logado exigem autenticação.
const ROTAS_PUBLICAS = ['/login', '/cadastro'];
const ROTAS_PROTEGIDAS = ['/carrinho', '/configuracoes', '/veiculo', '/agendamento', '/historico'];

function useProtecaoDeRotas(isAuthenticated: boolean, loading: boolean) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const emRotaPublica = ROTAS_PUBLICAS.includes(pathname);
    const emRotaProtegida = ROTAS_PROTEGIDAS.some(
      (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
    );

    if (!isAuthenticated && emRotaProtegida) {
      router.replace('/login');
    } else if (isAuthenticated && emRotaPublica) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, pathname, router]);
}

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();

  useProtecaoDeRotas(isAuthenticated, loading);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#B30000" />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="servicos/[servicoId]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="cadastro"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="veiculo"
          options={{
          title: 'Veiculo',
          headerShown: true,
          headerTitle: 'Veiculo',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#B30000',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold',
          },
        }}
        />
        <Stack.Screen
          name="agendamento"
          options={{
          title: 'Agendamento',
          headerShown: true,
          headerTitle: 'Agendamento',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#B30000',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold',
          },
        }}
        />
        <Stack.Screen
          name="historico"
          options={{
          title: 'Histórico',
          headerShown: true,
          headerTitle: 'Histórico',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#B30000',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold',
          },
        }}
        />
        <Stack.Screen
          name="historico/[id]"
          options={{
          title: 'Detalhes do agendamento',
          headerShown: true,
          headerTitle: 'Detalhes do agendamento',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#B30000',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold',
          },
        }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <FavoritosProvider>
          <RootLayoutNav />
        </FavoritosProvider>
      </CarrinhoProvider>
    </AuthProvider>
  );
}