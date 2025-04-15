import React from "react"
import { View, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export const PriceInfo = ({ sp, storage, mrp, discount }) => {

  const savingsAmount = Math.floor(mrp - sp)

  return (
    <View style={styles.container}>
      <View style={styles.mainPriceContainer}>
        <View style={styles.priceRow}>
          <Icon name="currency-inr" size={24} color="#1F2937" />
          <Text style={styles.price}>{sp}</Text>
          <View style={styles.mrpContainer}>
            <Icon name="currency-inr" size={16} color="#6B7280" />
            <Text style={styles.mrp}>{mrp}</Text>
          </View>
        </View>
        <View style={styles.discountBadge}>
          <Icon name="tag-outline" size={16} color="#059669" />
          <Text style={styles.discountText}>{discount}% OFF</Text>
        </View>
      </View>
      <View style={styles.savingsContainer}>
        <Icon name="piggy-bank-outline" size={16} color="#0A95DA" />
        <Text style={styles.savingsText}>
          Save <Text style={styles.savingsAmount}>₹{savingsAmount}</Text> on this order
        </Text>
      </View>

      <View style={[styles.savingsContainer, { backgroundColor: "#EF6642" }]}>
        {storage === "Store in a refrigerator (2 - 8°C). Do not freeze." ? <Icon name="weather-sunset-up" size={16} color="#fff" /> : <Icon name="coolant-temperature" size={16} color="#0A95DA" />}

        <Text style={styles.savingsText}>
          <Text style={[styles.savingsAmount, { color: '#fff' }]}>{storage}</Text>
        </Text>
      </View>
      {discount >= 20 && (
        <View style={styles.guaranteeContainer}>
          <Icon name="shield-check" size={16} color="#059669" />
          <Text style={styles.guaranteeText}>Best Price Guaranteed</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  mainPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginRight: 8,
  },
  mrpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mrp: {
    fontSize: 16,
    color: "#6B7280",
    textDecorationLine: "line-through",
    marginLeft: 2,
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  discountText: {
    color: "#059669",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  savingsText: {
    marginLeft: 6,
    color: "#0A95DA",
    fontSize: 14,
  },
  savingsAmount: {
    fontWeight: "700",
  },
  guaranteeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 8,
    borderRadius: 8,
  },
  guaranteeText: {
    marginLeft: 6,
    color: "#059669",
    fontSize: 14,
    fontWeight: "500",
  },
})

