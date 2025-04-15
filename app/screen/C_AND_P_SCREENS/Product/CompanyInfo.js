import React from "react"
import { View, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export const CompanyInfo = ({ name }) => (
  <View style={styles.companyRow}>
    <Icon name="office-building" size={20} color="#666" />
    <Text style={styles.companyName}>{name}</Text>
  </View>
)

const styles = StyleSheet.create({
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  companyName: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
})

