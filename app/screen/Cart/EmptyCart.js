import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
export default function EmptyCart() {
  const navigate = useNavigation()
  return (
    <View style={styles.emptyCartContainer}>
      <Icon name="cart-outline" size={80} color="#0A95DA" />
      <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyCartText}>
        Looks like you haven't added any items to your cart yet
      </Text>
      <TouchableOpacity onPress={() => navigate.navigate('Shop')} style={styles.shopNowButton}>
        <Text style={styles.shopNowText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  )
}