import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';

export default function BannerImage({ image }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 120,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'contain', // Ensures the image covers the container without distortion
  },
  text: {
    position: 'absolute',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
