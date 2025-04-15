import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExpertAdvice() {
  const adviceList = [
    {
      expert: 'Dr. Sarah Johnson',
      role: 'Oncologist',
      advice: 'Regular screening and early detection are crucial for successful treatment outcomes.',
    },
    {
      expert: 'Dr. Michael Chen',
      role: 'Cancer Researcher',
      advice: 'Modern cancer treatments are becoming more personalized and effective than ever before.',
    },
    {
      expert: 'Dr. Emily Rodriguez',
      role: 'Cancer Specialist',
      advice: 'A healthy lifestyle can significantly reduce your cancer risk. Focus on diet and exercise.',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expert Advice</Text>
      <Text style={styles.subtitle}>
        Leading oncologists share their insights on cancer prevention and treatment
      </Text>

      <View style={styles.adviceContainer}>
        {adviceList.map((item, index) => (
          <View key={index} style={styles.adviceCard}>
            <View style={styles.expertInfo}>
              <Text style={styles.expertName}>{item.expert}</Text>
              <Text style={styles.expertRole}>{item.role}</Text>
            </View>
            <Text style={styles.adviceText}>"{item.advice}"</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  adviceContainer: {
    gap: 16,
  },
  adviceCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  expertInfo: {
    marginBottom: 8,
  },
  expertName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  expertRole: {
    fontSize: 14,
    color: '#64748b',
  },
  adviceText: {
    fontSize: 16,
    color: '#4b5563',
    fontStyle: 'italic',
  },
});
