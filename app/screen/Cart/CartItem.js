import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import styles from './styles';
import { UpdateCartItem } from '../../store/slice/Cart/CartSlice';
import { useNavigation } from '@react-navigation/native';

const CartItem = ({ items }) => {
 
  const dispatch = useDispatch();
  const navigation = useNavigation()
  const handleQuantityChange = (productId, change) => {

    const item = items.find(item => item.ProductId === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {

        dispatch(UpdateCartItem({ ProductId: productId, quantity: newQuantity }));
      } else {

        dispatch(UpdateCartItem({ ProductId: productId, quantity: 0 }));
      }
    }
  };

  const defaultImage = 'https://via.placeholder.com/100x100.png?text=No+Image';

  return (
    <View style={styles.cartItemsContainer}>
      <Text style={styles.sectionTitle}>Cart Items ({items.length})</Text>
      {items.map((item) => (
        <View key={item.ProductId} style={styles.cartItem}>
          <Image
            source={{ uri: item.image || defaultImage }}
            style={styles.productImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.productTitle}>{item.title}</Text>
            <View style={styles.priceContainer}>

            <Text style={styles.price}>₹{item.Pricing.toLocaleString()}</Text>
            <Text style={styles.priceStrike}>₹{item.mrp.toLocaleString()}</Text>
              </View>
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => handleQuantityChange(item.ProductId, -1)}
              style={styles.quantityButton}
            >
              <Icon name="minus" size={20} color="#000" />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              onPress={() => handleQuantityChange(item.ProductId, 1)}
              style={styles.quantityButton}
            >
              <Icon name="plus" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={() => navigation.navigate('Shop')} activeOpacity={0.9} style={styles.plusItems}>
        <Icon name="plus" size={19} color="#0A95DA" style={styles.icon} />
        <Text style={styles.plushItemText}>Add More Items</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartItem;
