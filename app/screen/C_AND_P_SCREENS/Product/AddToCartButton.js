import React, { useState, useEffect } from "react"
import { StyleSheet, Text, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

const styles = StyleSheet.create({
  addToCartButton: {
    backgroundColor: "#0A95DA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    minWidth: 200,
  },
  addToCartText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    minWidth: 120,
  },
})

export const AddToCartButton = ({ onPress, isDisable }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDots, setLoadingDots] = useState("")

  useEffect(() => {
    let interval
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingDots((dots) => (dots.length < 3 ? dots + "." : ""))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const handlePress = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onPress()
    }, 500)
  }

  return (
    <>
      {isDisable ? (
       <TouchableOpacity onPress={handlePress} style={styles.addToCartButton} disabled={isLoading}>
       <Icon name={isLoading ? "cart-outline" : "cart-plus"} size={24} color="white" />
       <Text style={styles.addToCartText}>{isLoading ? `Adding to Cart${loadingDots}` : "Add to Cart"}</Text>
     </TouchableOpacity>
       
      ) : (
        <TouchableOpacity activeOpacity={0.8} style={styles.addToCartButton} disabled={isLoading}>
        <Icon name={isLoading ? "cart-outline" : "cart-plus"} size={24} color="white" />
        <Text style={styles.addToCartText}>Delivery Not Available</Text>
      </TouchableOpacity>
      )}

    </>
  )
}

