import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'

export default function CancerStages() {
    const stages = [
        { stage: 'Stage 0', description: 'Abnormal cells are present but contained' },
        { stage: 'Stage I', description: 'Cancer is small and localized' },
        { stage: 'Stage II & III', description: 'Cancer has grown and may have spread' },
        { stage: 'Stage IV', description: 'Cancer has spread to other parts of the body' }
      ];
  return (
    <View style={styles.container}>
    <Text style={styles.title}>Understanding Cancer Stages</Text>
    <Image
      src="https://www.lanermc.org/hubfs/2019-cancer-stages-blog-graphics-header-2.jpg"
      style={styles.stageImage}
      stretch="aspectFit"
    />
    <View style={styles.stagesContainer}>
      {stages.map((item, index) => (
        <View key={index} style={styles.stageCard}>
          <Text style={styles.stageTitle}>{item.stage}</Text>
          <Text style={styles.stageDescription}>{item.description}</Text>
        </View>
      ))}
    </View>
  </View>
  )
}

const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: '#ffffff'
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#1e293b'
    },
    stageImage: {
      width: '100%',
      height: 200,
      marginBottom: 20,
      borderRadius: 8
    },
    stagesContainer: {
      gap: 12
    },
    stageCard: {
      backgroundColor: '#f8fafc',
      padding: 16,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#3b82f6'
    },
    stageTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1e40af',
      marginBottom: 4
    },
    stageDescription: {
      fontSize: 14,
      color: '#64748b'
    }
  });