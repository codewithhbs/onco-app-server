import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'

export default function HeroSection() {
  return (
    <View style={styles.container}>
    <Image
      src="https://d35oenyzp35321.cloudfront.net/medium_introduction_to_cancer_1_37fa93bd5f.jpg"
      style={styles.heroImage}
      stretch="aspectFill"
    />
    <View style={styles.overlay}>
      <Text style={styles.title}>Cancer Library</Text>
      <Text style={styles.subtitle}>
        Understanding Cancer: A Comprehensive Guide
      </Text>
    </View>
  </View>
  )
}
const styles = StyleSheet.create({
    container: {
      height: 300,
      position: 'relative'
    },
    heroImage: {
      width: '100%',
      height: '100%'
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      backgroundColor: 'rgba(0,0,0,0.6)'
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 8
    },
    subtitle: {
      fontSize: 18,
      color: '#ffffff',
      opacity: 0.9
    }
  });