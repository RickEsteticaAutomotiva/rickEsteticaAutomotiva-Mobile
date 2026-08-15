import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { useCarrinho } from '../../context/CarrinhoContext';

function CarrinhoTabIcon({ color }: { color: string }) {
  const { registrarPosicaoCarrinho } = useCarrinho();
  const ref = useRef<View>(null);

  return (
    <View
      ref={ref}
      onLayout={() => {
        ref.current?.measureInWindow((x, y, width, height) => {
          registrarPosicaoCarrinho({ x: x + width / 2, y: y + height / 2 });
        });
      }}
    >
      <IconSymbol size={28} name="cart.fill" color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { quantidadeItens } = useCarrinho();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Cor dos ícones
        tabBarActiveTintColor: '#B30000',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="categoria"
        options={{
          title: 'Categoria',
          headerShown: true,
          headerTitle: 'Categorias',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#B30000',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="list.bullet"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="categoria/[categoriaId]"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="pesquisa"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="pesquisa/resultados"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          headerShown: true,
          headerTitle: 'Carrinho',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#B30000',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color }) => <CarrinhoTabIcon color={color} />,
          tabBarBadge: quantidadeItens > 0 ? quantidadeItens : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#B30000',
            color: '#FFFFFF',
          },
        }}
      />

      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="gear"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}