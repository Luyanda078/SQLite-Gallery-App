import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

const Map = ({ locations }) => {
  return (
    <View style={styles.mapContainer}>
      <MapView style={styles.map}>
        {locations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: { flex: 1 },
  map: { flex: 1 },
});

export default Map;
