import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Features() {
  const features = [
    {
      title: 'PAN India Delivery',
      description: 'Fast and reliable delivery across all states',
      icon: '🚚'
    },
    {
      title: 'Quality Assured',
      description: 'All medicines are quality checked and verified',
      icon: '✓'
    },
    {
      title: 'Secure Payments',
      description: 'Multiple secure payment options available',
      icon: '🔒'
    },
    {
      title: '24/7 Support',
      description: 'Round the clock customer support',
      icon: '💬'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why Choose Us</Text>
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <Text style={styles.icon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8
  },
  icon: {
    fontSize: 24,
    marginBottom: 8
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  featureDescription: {
    fontSize: 14,
    color: '#4b5563'
  }
});