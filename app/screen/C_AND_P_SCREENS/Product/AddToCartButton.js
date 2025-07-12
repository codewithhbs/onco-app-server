import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

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
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

export const AddToCartButton = ({ onPress, isDisable, stock }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingDots((dots) => (dots.length < 3 ? dots + "." : ""));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handlePress = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onPress();
    }, 500);
  };

  let buttonText = "Add to Cart";
  let iconName = isLoading ? "cart-outline" : "cart-plus";
  let disabled = isLoading;

  if (!stock) {
    buttonText = "Out of Stock";
    iconName = "close-circle-outline";
    disabled = true;
  } else if (!isDisable) {
    buttonText = "Delivery Not Available";
    iconName = "truck-off";
    disabled = true;
  } else if (isLoading) {
    buttonText = `Adding to Cart${loadingDots}`;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.addToCartButton,
        (disabled || !stock || !isDisable) && styles.disabledButton,
      ]}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Icon name={iconName} size={24} color="white" />
      <Text style={styles.addToCartText}>{buttonText}</Text>
    </TouchableOpacity>
  );
};
