import {View, Text, Button, StyleSheet } from 'react-native'
import React from 'react'

export default function MedicineSection() {
    const medicines = [
        {
          name: 'Chemotherapy Drugs',
          description: 'Standard treatment for various cancers',
          price: '₹2,999',
          icon: '💊'
        },
        {
          name: 'Targeted Therapy',
          description: 'Precision medicine for specific cancer types',
          price: '₹5,999',
          icon: '🎯'
        },
        {
          name: 'Immunotherapy',
          description: 'Boosts immune system to fight cancer',
          price: '₹8,999',
          icon: '🛡️'
        }
      ];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Medicines</Text>
      <View style={styles.medicineGrid}>
        {medicines.map((medicine, index) => (
          <View key={index} style={styles.medicineCard}>
            <Text style={styles.medicineIcon}>{medicine.icon}</Text>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.medicineDescription}>{medicine.description}</Text>
            <Text style={styles.medicinePrice}>{medicine.price}</Text>
            <Button 
              style={styles.addButton}
              title=' Add to Cart'
              onTap={() => console.log(`Added ${medicine.name} to cart`)}
            >
            
            </Button>
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
      marginBottom: 20,
      color: '#1e293b'
    },
    medicineGrid: {
      gap: 16
    },
    medicineCard: {
      backgroundColor: '#f8fafc',
      padding: 16,
      borderRadius: 12,
      elevation: 2
    },
    medicineIcon: {
      fontSize: 32,
      marginBottom: 8
    },
    medicineName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1e40af',
      marginBottom: 4
    },
    medicineDescription: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 8
    },
    medicinePrice: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#059669',
      marginBottom: 12
    },
    addButton: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: 12,
      borderRadius: 6,
      textAlign: 'center'
    }
  });