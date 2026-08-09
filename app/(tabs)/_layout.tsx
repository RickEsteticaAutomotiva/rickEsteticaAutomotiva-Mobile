import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
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
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="cart.fill"
              color={color}
            />
          ),
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