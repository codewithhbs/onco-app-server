import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Symptoms() {
  const commonSymptoms = [
    {
      category: 'Physical Changes',
      symptoms: [
        'Unexplained weight loss',
        'Unusual bleeding or bruising',
        'Changes in skin color or texture',
        'Persistent fatigue',
      ],
    },
    {
      category: 'Pain Signals',
      symptoms: [
        'Persistent pain',
        'Headaches that don’t go away',
        'Bone or joint pain',
        'Unexplained muscle pain',
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Common Cancer Symptoms</Text>
      <Text style={styles.disclaimer}>
        Early detection is crucial. Contact your doctor if you notice any of these symptoms:
      </Text>

      {commonSymptoms.map((group, index) => (
        <View key={index} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{group.category}</Text>
          {group.symptoms.map((symptom, sympIndex) => (
            <View key={sympIndex} style={styles.symptomItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.symptomText}>{symptom}</Text>
            </View>
          ))}
        </View>
      ))}
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
    marginBottom: 12,
  },
  disclaimer: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 20,
  },
  categoryContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
  },
  symptomItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#3b82f6',
    marginRight: 8,
  },
  symptomText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
});
