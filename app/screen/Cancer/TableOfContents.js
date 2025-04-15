import { View, Text,StyleSheet } from 'react-native'
import React from 'react'

export default function TableOfContents() {
    const sections = [
        { title: 'What is Cancer?', icon: '🔬' },
        { title: 'Stages of Cancer', icon: '📊' },
        { title: 'Common Symptoms', icon: '🏥' },
        { title: 'Expert Advice', icon: '👨‍⚕️' },
        { title: 'Available Medicines', icon: '💊' }
      ];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Table of Contents</Text>
      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.icon}>{section.icon}</Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: '#f8fafc',
      margin: 16,
      borderRadius: 12,
      elevation: 2
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#1e293b'
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0'
    },
    icon: {
      fontSize: 24,
      marginRight: 12
    },
    sectionTitle: {
      fontSize: 16,
      color: '#334155'
    }
  });