import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { AddingSuccess } from '../../store/slice/Cart/CartSlice';
import { useNavigation } from '@react-navigation/native';

const ProductCard = ({ product }) => {
    const discountedPrice = product.product_mrp - product.discount_amount;
    const isInStock = product.stock === 'In Stock';
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const handleAddToCart = ({ item }) => {
        if (!item) {
            console.log("Item is not defined");
            return;
        }

        navigation.navigate("Product_info", { id: item.product_id, title: item?.product_name })
        // const newItem = {
        //     ProductId: item.product_id || null,
        //     title: item.product_name || "Unknown Product",
        //     quantity:1,
        //     Pricing: item.product_sp || 0,
        //     image: product?.image_1 || null,
        //     company_name: item.company_name || "Unknown Company",
        // };

        // Alert.alert('Item Added')



    };
    return (
        <View style={styles.card}>
            <Image source={{ uri: product.image_1 }} style={styles.image} />
            <TouchableOpacity onPress={() => navigation.navigate('Product_info', { id: product.product_id, title: product?.product_name })} style={styles.content}>
                <View style={styles.details}>
                    <Text style={styles.name}>{product.product_name}</Text>
                    <Text style={styles.salt}>{product.salt}</Text>
                    <Text style={styles.quantity}>{product.weight_quantity}</Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{discountedPrice.toFixed(2)}</Text>
                    <Text style={styles.mrp}>MRP: ₹{product.product_mrp}</Text>
                    <Text style={styles.discount}>₹{product.discount_amount} off</Text>
                </View>

                <TouchableOpacity
                    onPress={() => handleAddToCart({ item: product })}
                    style={[styles.addButton, !isInStock && styles.outOfStock]}
                    disabled={!isInStock}
                >
                    <Icon
                        name={isInStock ? 'cart-plus' : 'cart-off'}
                        size={20}
                        color="white"
                    />
                    <Text style={styles.buttonText}>
                        {isInStock ? 'Add to Cart' : 'Out of Stock'}
                    </Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
    },
    image: {
        borderWidth: 1,
        width: 100,
        height: 100,
        borderRadius: 4,
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    salt: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    quantity: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    priceContainer: {
        marginTop: 8,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    mrp: {
        fontSize: 14,
        color: '#666',
        textDecorationLine: 'line-through',
    },
    discount: {
        fontSize: 14,
        color: '#4CAF50',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0A95DA',
        borderRadius: 4,
        paddingVertical: 8,
        marginTop: 8,
    },
    outOfStock: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ProductCard;