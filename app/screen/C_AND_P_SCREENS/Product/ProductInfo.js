import React, { useState, useEffect, useContext } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRoute } from "@react-navigation/native"
import { useDispatch } from "react-redux"
import { AddingSuccess } from "../../../store/slice/Cart/CartSlice"
import * as Haptics from "expo-haptics"
import axios from 'axios'
import CustomPSlide from "../CustomPSlide"
import Check_Shipping from "./Check_Shipping"
import { ProductHeader } from "./ProductHeader"
import { ProductDetails } from "../ProductDetails"
import { AddToCartButton } from "./AddToCartButton"
import { QuantitySelector } from "./QuantitySelector"
import { PriceInfo } from "./PriceInfo"
import { CompanyInfo } from "./CompanyInfo"
import { PrescriptionRequired } from "./PrescriptionRequired"
import { AddedToCartMessage } from "./AddedToCartMessage"
import { LocationContext } from "../../../utils/Location"
import Layout from "../../../components/Layout/Layout"
import { API_V1_URL } from "../../../constant/API"

export default function ProductInfo() {
  const route = useRoute()
  const { id } = route.params || {}
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shippingAvailable, setShippingAvailable] = useState(true)
  const { location, getLocation } = useContext(LocationContext)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [images, setImages] = useState([])
  const dispatch = useDispatch()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    loadProductDetails()
  }, [])

  useEffect(() => {
    if (product) {
      const productImages = [
        product?.image_1,
        product?.image_2,
        product?.image_3,
        product?.image_4,
        product?.image_5,
      ].filter(Boolean)
      setImages(productImages)
    }
  }, [product])


  const loadProductDetails = async () => {
    try {
      const { data } = await axios.get(`${API_V1_URL}/api/v1/get-product/${id}`)
      setProduct(data.data)
    } catch (err) {
      setError("Failed to load product details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // console.log(shippingAvailable)
  const handleAddToCart = () => {
    if (!product) return

    const newItem = {
      ProductId: product.product_id,
      title: product.product_name,
      quantity: quantity,
      Pricing: product.product_sp,
      mrp: product.product_mrp,
      image: product.image_1,
      isCOD: product?.isCOD === 1 ? true : false,
      company_name: product.company_name,
    }

    dispatch(AddingSuccess({ Cart: [newItem] }))
    setShowMessage(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    setTimeout(() => setShowMessage(false), 4000)
  }

  if (loading) return <LoadingView />
  if (error) return <ErrorView message={error} />
  if (!product) return <ErrorView message="Product not found" />

  const discountPercentage = Math.round(((product.product_mrp - product.product_sp) / product.product_mrp) * 100)

  if (!location) {
    getLocation()
    console.log("Fetching location...")
    // Retry after 5 seconds if location is not fetched yet.
  }
  return (
    <Layout isLocation={false} isSearchShow={false}>
      <ScrollView style={styles.scrollView}>
        <CustomPSlide images={images} autoPlay={true} isThumb={true} delay={4500} mode="cover" height={350} />
        <ProductHeader />
        <View style={styles.contentContainer}>
          <Text style={styles.productName}>{product.product_name}</Text>
          <CompanyInfo name={product.company_name} />
          <PriceInfo sp={product.product_sp} storage={product?.storage} mrp={product.product_mrp} discount={discountPercentage} />
          <Text style={styles.quantity}>{product.weight_quantity}</Text>
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => setQuantity((q) => q + 1)}
            onDecrease={() => quantity > 1 && setQuantity((q) => q - 1)}
          />
          <Check_Shipping location={location?.weather} shiipingAvailablity={setShippingAvailable} />
          <AddToCartButton isDisable={shippingAvailable} onPress={handleAddToCart} />
          {product.presciption_required === "Yes" && <PrescriptionRequired />}
          <ProductDetails
            description={product.short_description}
            benefits={product.benifits}
            storage={product.storage}
            sideEffects={product.side_effects}
          />
        </View>
      </ScrollView>
      {showMessage && <AddedToCartMessage item={product} />}
    </Layout>
  )
}

const LoadingView = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator style={{ marginBottom: 10 }} />
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
      Loading Product details...
    </Text>
  </View>
);


const ErrorView = ({ message }) => (
  <View style={styles.centerScreen}>
    <Text style={styles.errorText}>{message}</Text>
  </View>
)

const styles = StyleSheet.create({

  scrollView: {
    flex: 1,
    backgroundColor: "#fff",

  },
  contentContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  quantity: {
    marginVertical: 14,
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginTop: 10,
  },
})

