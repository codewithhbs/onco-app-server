import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapViewComponent = () => {
  const region = {
    latitude: 13.0418,
    longitude: 80.2341,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.mapImage}
        initialRegion={region}
      >
        <Marker coordinate={{ latitude: 13.0418, longitude: 80.2341 }} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject, // Makes the map fill the entire container
  },
});

export default MapViewComponent;
