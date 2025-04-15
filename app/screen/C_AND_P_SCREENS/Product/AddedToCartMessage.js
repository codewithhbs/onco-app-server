import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export const AddedToCartMessage = ({ item }) => {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="check-circle" size={60} color="#0A95DA" />
      </View>
      <Text style={styles.titleText}>{item?.product_name} Added to Cart</Text>
      <Text style={styles.subtitleText}>
        Your item has been successfully added to your cart. Continue shopping or proceed to checkout!
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Shop")} style={styles.button}>
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={[styles.button, styles.checkoutButton]}>
          <Text style={[styles.buttonText, styles.checkoutButtonText]}>Go to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FFF9",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 15,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A95DA",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: "#cce7f5",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000e14",
  },
  checkoutButton: {
    backgroundColor: "#c24d42",
  },
  checkoutButtonText: {
    color: "#fff",
  },
})

