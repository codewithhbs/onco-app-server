import React, { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import axios from "axios"
import { API_V1_URL } from "../../constant/API"

const { width } = Dimensions.get("window")

const CouponsSlider = ({ onApply }) => {
  const [coupons, setCoupons] = useState([])
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const slideAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  const fetch_data = async () => {
    try {
      const { data } = await axios.get(`${API_V1_URL}/api/v1/check_coupons`)
      setCoupons(data.data)
    } catch (error) {
      console.log(error)
    }
  }

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()
  }, [scaleAnim]) // Added scaleAnim to dependencies

  useEffect(() => {
    fetch_data()
  }, [])

  const applyCoupon = (coupon) => {
    setSelectedCoupon(coupon.CODE)
    onApply(coupon)
  }

  const renderItem = ({ item, index }) => {
    const isSelected = selectedCoupon === item.CODE

    return (
      <Animated.View
        style={[
          styles.couponContainer,
          {
            opacity: slideAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: isSelected ? `#ffffff` : "#ffffff",
            borderColor: isSelected ? item.theme : "#E5E7EB",
          },
        ]}
      >
        {/* Coupon Header */}
        {item?.percenatge_off ? (
          <View style={[styles.discountBadge, { backgroundColor: item.theme }]}>
            <Icon name="brightness-percent" size={16} color="#FFF" />
            <Text style={styles.discountText}>{item.percenatge_off}%</Text>
          </View>
        ) : (
          <View style={[styles.discountBadge, { backgroundColor: item.theme }]}>
            <Icon name="truck-check-outline" size={16} color="#FFF" />
            <Text style={styles.discountText}>Free Delivery</Text>
          </View>
        )}

        {/* Coupon Details */}
        <View style={styles.couponDetails}>
          <Text style={styles.description}>{item.desc_code}</Text>
          <View style={styles.infoRow}>
            {item?.maxDiscount && <Text style={styles.infoText}>Up to {item.maxDiscount}</Text>}
            <View style={styles.dot} />
            <Text style={styles.infoText}>Min order {item.min_order_value}</Text>
          </View>
        </View>

        {/* Coupon Code Section */}
        <View style={styles.codeSection}>
          <View style={styles.codeBorder}>
            <Text style={styles.codeText}>{item.CODE}</Text>
          </View>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: isSelected ? "#E5E7EB" : item.theme }]}
            onPress={() => applyCoupon(item)}
          >
            <Text style={[styles.applyButtonText, { color: isSelected ? "#374151" : "#FFFFFF" }]}>
              {isSelected ? "APPLIED" : "APPLY"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="ticket-percent" size={24} color="#0A95DA" />
          <Text style={styles.title}>Available Offers</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        snapToInterval={width * 0.85 + 10}
        decelerationRate="fast"
        bounces={false}
      >
        {coupons.map((item) => (
          <View key={item.id} style={styles.couponContainer}>
            {renderItem({ item })}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  listContainer: {
    flexDirection: 'row',
    borderWidth: 0.2,
    paddingHorizontal: 0,
  },
  couponContainer: {
    width: width * 0.75,
    marginHorizontal: 1,
    borderRadius: 16,
    padding: 12,

  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  couponDetails: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  codeSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  codeBorder: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 1,
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  validityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  validityText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
})

export default CouponsSlider

