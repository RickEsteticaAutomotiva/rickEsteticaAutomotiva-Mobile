import MapView, { Marker } from 'react-native-maps';
import { View } from 'react-native';

export function Mapa() {
  return (
    <View
      className="w-full overflow-hidden rounded-xl"
      style={{ height: 160 }}
    >
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: -23.53453698467894,
          longitude: -46.51234178502112,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: -23.53453698467894,
            longitude: -46.51234178502112,
          }}
          title="Rick Estética Automotiva"
          description="R. Alcatifa, 81 - Jardim Brasília, São Paulo - SP"
        />
      </MapView>
    </View>
  );
}