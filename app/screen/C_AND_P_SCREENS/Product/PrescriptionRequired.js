import React from "react"
import { View, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export const PrescriptionRequired = () => (
  <View style={styles.prescriptionRequired}>
    <Icon name="prescription" size={20} color="#dc2626" />
    <Text style={styles.prescriptionText}>Prescription Required</Text>
  </View>
)

const styles = StyleSheet.create({
  prescriptionRequired: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  prescriptionText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
})

