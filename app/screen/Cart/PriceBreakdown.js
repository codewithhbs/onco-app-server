
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import axios from "axios"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import useSettings from "../../hooks/Settingshook"
import { API_V1_URL } from "../../constant/API"

const { width } = Dimensions.get("window")

const PriceBreakdown = ({ items, coupons, enabledCheckOutButton = false, logged }) => {
  const { settings } = useSettings()
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCouponInput, setShowCouponInput] = useState(false)
  const navigation = useNavigation()

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-50)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const buttonScaleAnim = useRef(new Animated.Value(1)).current

  // Calculate prices
  const subtotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0)

  const oncoDiscount = items.reduce((sum, item) => sum + item.Pricing * item.quantity, 0)

  const totalWithoutDiscount = subtotal
  const discountAmount = appliedCoupon?.discount || 0
  const deliveryFee = subtotal - (subtotal - oncoDiscount || 0) > settings?.shipping_threshold ? 0 : Number(settings?.shipping_charge)
  const grandTotal = oncoDiscount + deliveryFee - discountAmount
  const totalSavings = subtotal - oncoDiscount + discountAmount

  // Handle coupon application
  const handleApplyCoupon = async () => {

    if (!couponCode.trim() && !coupons?.CODE) {
      animateShake()
      setError("Please enter a coupon code")
      return
    }

    try {
      setLoading(true)
      setError("")

      const { data } = await axios.post(`${API_V1_URL}/api/v1/apply-coupon_code`, {
        couponCode: coupons?.CODE?.trim() || couponCode.trim(),
        ProductsFromCart: items,
        totalPrice: totalWithoutDiscount,
      })

      if (data.success) {
        setAppliedCoupon({
          code: coupons?.CODE?.trim() || couponCode.trim(),
          discount: data.discount,
        })
        setCouponCode("")
        animateSuccess()
      } else {
        setError(data.message || "Invalid coupon code")
        animateShake()
      }
    } catch (error) {
      setError(`We're sorry, but this coupon code appears to be invalid. Please check the details and try again`)
      animateShake()
      console.error("Coupon application error:", error.response.data)
    } finally {
      setLoading(false)
    }
  }

  const animateShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }

  const animateSuccess = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -50, duration: 300, useNativeDriver: true }),
        ]).start()
      }, 2000)
    })
  }

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  useEffect(() => {

    handleApplyCoupon()
    setCouponCode('')
    setAppliedCoupon('')
  }, [coupons?.CODE])

  const toggleCouponInput = () => {
    setShowCouponInput(!showCouponInput)
  }

  // Apply coupon from props if available
  useEffect(() => {
    if (coupons?.CODE) {
      handleApplyCoupon()
    }
  }, [coupons?.CODE]) // Removed handleApplyCoupon from dependencies

  // Navigate to checkout
  const goToCheckOut = () => {
    animateButtonPress()
    const orderDetails = {
      items: items,
      totalPrice: grandTotal,
      couponCode: appliedCoupon?.code || "",
      discount: appliedCoupon?.discount || 0,
    }

    navigation.navigate("Billing", { cart: orderDetails })
  }

  // Navigate to login
  const goToLogin = () => {
    animateButtonPress()
    navigation.navigate("login", { comeScreen: "Cart" })
  }

  // Render price row with label and value
  const renderPriceRow = (label, value, type = "regular", icon = null) => (
    <View style={styles.priceRow}>
      <View style={styles.priceRowLeft}>
        {icon && <Icon name={icon} size={16} color={type === "discount" ? "#4CAF50" : "#555"} style={styles.rowIcon} />}
        <Text
          style={[
            styles.priceLabel,
            type === "total" && styles.totalLabel,
            type === "discount" && styles.discountLabel,
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[styles.priceValue, type === "total" && styles.totalValue, type === "discount" && styles.discountValue]}
      >
        {value}
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.savingsCard}>
          <Icon name="truck-delivery" size={14} color="#4CAF50" />
          <Text style={[styles.savingsText, { fontSize: 11 }]}>
            🎉 Enjoy <Text style={styles.savingsAmount}>FREE Delivery</Text> on orders above ₹{settings?.shipping_threshold}! 🚚✨
          </Text>
        </View>


        {totalSavings > 0 && (
          <View style={styles.savingsCard}>
            <Icon name="tag-heart" size={14} color="#4CAF50" />
            <Text style={styles.savingsText}>
              You're saving <Text style={styles.savingsAmount}>₹{totalSavings.toLocaleString()}</Text> on this order!
            </Text>
          </View>
        )}



        <View style={styles.priceBreakdown}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt" size={20} color="#0A95DA" />
            <Text style={styles.sectionTitle}>Price Details</Text>
          </View>

          <View style={styles.divider} />

          {renderPriceRow("Total Mrp", `₹${subtotal.toLocaleString()}`, "regular", "cart")}
          {renderPriceRow(
            "OncoHealthMart Discount",
            `- ₹${(subtotal - oncoDiscount).toLocaleString()}`,
            "discount",
            "sale",
          )}
          {renderPriceRow("Total Cart Value", `₹${(subtotal - (subtotal - oncoDiscount || 0)).toLocaleString()}`, "regular", "cart")}
          {renderPriceRow(
            "Delivery Fee",
            deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`,
            deliveryFee === 0 ? "discount" : "regular",
            "truck-delivery",
          )}


          {appliedCoupon &&
            renderPriceRow(
              `Coupon (${appliedCoupon.code})`,
              `- ₹${discountAmount.toLocaleString()}`,
              "discount",
              "ticket-percent",
            )}

          <View style={styles.divider} />

          {renderPriceRow("Order Total", `₹${grandTotal.toLocaleString()}`, "total", "cash-multiple")}
        </View>



        {!enabledCheckOutButton && (
          <View style={styles.prescriptionNote}>
            <Icon name="prescription" size={24} color="#ff1a1a" />
            <Text style={styles.noteText}>Please upload your prescription to proceed.</Text>
          </View>
        )}
      </ScrollView>

      {/* Checkout button */}
      <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
        {logged ? (
          <TouchableOpacity
            onPress={goToCheckOut}
            disabled={!enabledCheckOutButton}
            activeOpacity={0.8}
            style={[styles.checkoutButton, !enabledCheckOutButton && styles.disabledCheckout]}
          >
            <LinearGradient
              colors={enabledCheckOutButton ? ["#0A95DA", "#0A7CB8"] : ["#E0E0E0", "#CCCCCC"]}
              style={styles.checkoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.checkoutContent}>
                <View style={styles.checkoutLeft}>
                  <Text style={[styles.checkoutTotal, !enabledCheckOutButton && styles.disabledCheckoutText]}>
                    ₹{grandTotal.toLocaleString()}
                  </Text>
                  <Text style={[styles.viewDetailText, !enabledCheckOutButton && styles.disabledCheckoutText]}>
                    {totalSavings > 0 ? `You save ₹${totalSavings.toLocaleString()}` : "View price details"}
                  </Text>
                </View>
                <View style={styles.checkoutRight}>
                  <Text style={[styles.checkoutButtonText, !enabledCheckOutButton && styles.disabledCheckoutText]}>
                    Proceed to Checkout
                  </Text>
                  <Icon name="chevron-right" size={20} color={enabledCheckOutButton ? "#fff" : "#999"} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={goToLogin} activeOpacity={0.8} style={styles.checkoutButton}>
            <LinearGradient
              colors={["#0A95DA", "#0A7CB8"]}
              style={styles.checkoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.checkoutContent}>
                <View style={styles.checkoutLeft}>
                  <Text style={styles.checkoutTotal}>₹{grandTotal.toLocaleString()}</Text>
                  <Text style={styles.viewDetailText}>Login to continue</Text>
                </View>
                <View style={styles.checkoutRight}>
                  <Text style={styles.checkoutButtonText}>Login / Register</Text>
                  <Icon name="chevron-right" size={20} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  )
}

const styles = {
  container: {
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 8,
    paddingBottom: 20,

  },
  scrollContainer: {
    // maxHeight: 400,
    marginBottom: 16,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  successText: {
    color: "#4CAF50",
    marginLeft: 8,
    fontWeight: "500",
  },
  savingsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  savingsText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  savingsAmount: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  priceBreakdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,

  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    marginRight: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#555",
  },
  priceValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A95DA",
  },
  discountLabel: {
    color: "#4CAF50",
  },
  discountValue: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  couponSection: {

    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  couponToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  couponToggleText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#0A95DA",
  },
  couponInputContainer: {
    flexDirection: "row",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#F5F5F5",
  },
  applyButton: {
    backgroundColor: "#0A95DA",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 8,
  },
  appliedCouponContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  appliedCouponText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  couponCodeText: {
    fontWeight: "600",
    color: "#4CAF50",
  },
  prescriptionNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ff1a1a",
  },
  noteText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  checkoutButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  checkoutGradient: {
    borderRadius: 12,
  },
  disabledCheckout: {
    opacity: 0.9,
  },
  checkoutContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  checkoutLeft: {
    flex: 1,
  },
  checkoutTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  viewDetailText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  checkoutRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginRight: 8,
  },
  disabledCheckoutText: {
    color: "#999",
  },
}

export default PriceBreakdown

