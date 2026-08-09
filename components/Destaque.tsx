import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const destaques = [
  {
    id: '1',
    titulo: 'Destaque',
    cor: 'bg-red-700',
  },
  {
    id: '2',
    titulo: 'Whatsapp',
    cor: 'bg-green-500',
  },
  {
    id: '3',
    titulo: 'Instagram',
    cor: 'bg-blue-500',
  },
];

export function Destaque() {
  const [indiceAtual, setIndiceAtual] = useState(0);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setIndiceAtual(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  return (
    <View className="w-full px-5">
      <FlatList
        data={destaques}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{
            gap: 14,
        }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => (
          <View
            style={{
              width: width - 40
              ,
            }}
            className={`mr-0 h-[213px] overflow-hidden rounded-xl ${item.cor} shadow-md`}
          >
            <View className="flex-1 items-center justify-center">
              <Text className="text-4xl font-bold text-white">
                {item.titulo}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Indicadores */}
      <View className="mt-2 flex-row items-center justify-center gap-1.5">
        {destaques.map((item, index) => (
          <View
            key={item.id}
            className={`h-2.5 w-2.5 rounded-full ${
              index === indiceAtual
                ? 'bg-red-700'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </View>
    </View>
  );
}