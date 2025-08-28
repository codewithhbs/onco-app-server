import React, { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import styles from "./styles";
import Header from "../../components/Header/Header";
import EmptyCart from "./EmptyCart";
import CartItem from "./CartItem";
import PrescriptionUpload from "./PrescriptionUpload";
import PriceBreakdown from "./PriceBreakdown";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import CouponsSlider from "./Coupons_slider";
import Cashback from "./Cashback";

const Cart = () => {
  const { CartItems, CartCount } = useSelector((state) => state.cart) || {};
  const [loggedUser, setLoggedUser] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [uploaded, setUploaded] = useState(false);
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    const checkUserToken = async () => {
      try {
        const data = await SecureStore.getItemAsync("token");
        const token = JSON.parse(data);

        if (token) {
          setLoggedUser(true);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        setLoggedUser(false);
      }
    };

    checkUserToken();
  }, []);

  const handleCouponApply = (code) => {
    console.log("handleCouponApply",code)
    setCoupon(code);
  };
  const handleCouponRemove = () => {

    setCoupon(null);
  };


  const handlePickImage = async () => {
    try {
      const response = await new Promise((resolve) =>
        Alert.alert(
          "Select Image Source",
          "Choose an option",
          [
            { text: "Camera", onPress: () => resolve("camera") },
            { text: "Gallery", onPress: () => resolve("gallery") },
            { text: "Cancel", onPress: () => resolve(null), style: "cancel" },
          ],
          { cancelable: true }
        )
      );

      if (!response) return;

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need permission to access your camera and media.");
        return;
      }

      let result;
      if (response === "camera") {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          allowsMultipleSelection: true,
          quality: 0.7,
          selectionLimit: 5,
        });
      }

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        }));

        setPrescriptions((prevPrescriptions) => [...prevPrescriptions, ...newImages].slice(0, 5));
        setUploaded(true);
        await SecureStore.setItem("prescriptions", JSON.stringify(newImages));
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleRemovePrescription = (index) => {
    setPrescriptions((prevPrescriptions) =>
      prevPrescriptions.filter((_, i) => i !== index)
    );
    setUploaded(false);
  };

  if (!CartItems?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Header isSearchShow={false} />
        <EmptyCart />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header isLocation={false} isSearchShow={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Cashback onApply={handleCouponApply} onRemove={handleCouponRemove} alreadyApplies={coupon} />
          <CartItem items={CartItems} />
          <PrescriptionUpload
            handlePickImage={handlePickImage}
            prescriptions={prescriptions}
            handleRemovePrescription={handleRemovePrescription}
          />


          <PriceBreakdown enabledCheckOutButton={uploaded} coupons={coupon} logged={loggedUser} items={CartItems} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Cart;
