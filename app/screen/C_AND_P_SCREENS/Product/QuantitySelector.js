import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export const QuantitySelector = ({ quantity, onIncrease, onDecrease }) => (
  <View style={styles.quantityControls}>
    <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
      <Icon name="minus" size={20} color="#0A95DA" />
    </TouchableOpacity>
    <Text style={styles.quantityText}>{quantity}</Text>
    <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
      <Icon name="plus" size={20} color="#0A95DA" />
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#f3f4f6",
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  quantityButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 17.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 15,
  },
})

