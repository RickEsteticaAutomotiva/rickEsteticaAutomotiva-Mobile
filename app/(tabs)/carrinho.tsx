import React from 'react';
import { View, Text } from 'react-native';
import { CarrinhoBottom } from '../../components/CarrinhoBottom';

export default function Carrinho() {
  return (
    <View className="flex-1" style={{ backgroundColor: '#f7f7f7' }}>
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-2xl font-bold">Cart</Text>
      </View>
      <View className="absolute bottom-0 left-0 right-0">
        <CarrinhoBottom />
      </View>
    </View>
  );
}
