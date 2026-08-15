import { Image, View } from 'react-native';

export function HeaderLogo() {
    return (
        <View className="flex direction-col justify-center bg-white p-4 pb-0 shadow w-full h-[100px]" style={{ backgroundColor: '#B30000' }}>
            {/* Logo */}
            <View className="w-full flex items-center mb-4">
                <Image
                    source={require('../assets/rick_logo.png')}
                    className="w-12 h-12"
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}