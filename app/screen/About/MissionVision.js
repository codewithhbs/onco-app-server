import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MissionVision() {
  return (
    <View style={styles.container}>
      <View style={styles.missionBox}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionText}>
          To provide affordable Cancer and Specialized medicines to one and all, 
          offering solutions for all your medicinal needs with uncompromising quality.
        </Text>
      </View>

      <View style={styles.visionBox}>
        <Text style={styles.sectionTitle}>Our Vision</Text>
        <Text style={styles.sectionText}>
          To become India's most trusted healthcare partner by providing 
          accessible, affordable, and quality healthcare solutions to every Indian household.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32
  },
  missionBox: {
    marginBottom: 24,
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8
  },
  visionBox: {
    backgroundColor: '#faf5ff',
    padding: 16,
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#166534'
  },
  sectionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24
  }
});