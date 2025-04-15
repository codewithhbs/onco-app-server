import React, { useMemo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export const ProductCard = React.memo(({ product }) => {
  const navigation = useNavigation();

  // Memoized discount calculation
  const discountInfo = useMemo(() => {
    const mrp = Number(product.product_mrp);
    const sp = Number(product.product_sp);
    const discount = mrp - sp;
    const discountPercentage = Math.round((discount / mrp) * 100);

    return {
      discount,
      discountPercentage
    };
  }, [product.product_mrp, product.product_sp]);

  // Memoized navigation handler
  const handleProductNavigation = useCallback(() => {
    navigation.navigate("Product_info", {
      id: product.product_id,
      title: product?.product_name
    });
  }, [navigation, product.product_id, product.product_name]);

  // Memoized image source
  const imageSource = useMemo(() =>
    product.image_1
      ? { uri: product.image_1 }
      : require('./No_Image_Available.jpg')
    , [product.image_1]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleProductNavigation}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.productImage}
          resizeMode="contain"
        />

        {discountInfo.discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {discountInfo.discountPercentage}% OFF
            </Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.product_name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.salePrice}>₹{product.product_sp}</Text>
          <Text style={styles.mrpPrice}>₹{product.product_mrp}</Text>
        </View>

        <View style={styles.bottomContainer}>
          <Text numberOfLines={1} style={styles.quantity}>
            <Icon name="package-variant" size={14} color="#666" />
            {' '}{product.weight_quantity}
          </Text>
        </View>

        <View>
          <TouchableOpacity
            onPress={handleProductNavigation}
            activeOpacity={0.85}
            style={styles.addToCartButton}
          >
            <Icon name="cart-outline" size={18} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});


const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  productImage: {
    width: '100%',
    height: '100%',

  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0088CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    // height: 40,
  },
  companyName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A95DA',
    marginRight: 8,
  },
  mrpPrice: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 10,
    color: '#666',
  },
  addToCartButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#0A95DA',
    marginTop: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
