import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderLogo } from './HeaderLogo';

type AuthCardProps = {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  footerTexto: string;
  footerAcaoTexto: string;
  onFooterPress: () => void;
};

export function AuthCard({
  titulo,
  subtitulo,
  children,
  footerTexto,
  footerAcaoTexto,
  onFooterPress,
}: AuthCardProps) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: '#FFFFFF' }}
        keyboardShouldPersistTaps="handled"
      >
        <HeaderLogo />

        <View className="flex items-center justify-center bg-white">
          <View className="w-full h-32 rounded-t-lg mb-5 justify-center items-center border-b border-gray-200">
            <Text className="text-2xl font-bold">{titulo}</Text>
            <Text className="text-base text-gray-600 mt-2">{subtitulo}</Text>
          </View>

          <View className="w-full px-5 align-start">
            {children}

            <Pressable
              className="p-5 border-t border-gray-200 w-full items-center"
              onPress={onFooterPress}
            >
              <Text className="text-base text-gray-600 text-center">
                {footerTexto} <Text className="text-red-700 font-semibold">{footerAcaoTexto}</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
