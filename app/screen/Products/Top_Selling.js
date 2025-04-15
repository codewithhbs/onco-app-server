import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
    View,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Text,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
    Image,
} from "react-native"
import axios from "axios"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useNavigation } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import CircleLoader from "../../components/Loader/CircleLoader"
import { API_V1_URL } from "../../constant/API"

const { width } = Dimensions.get("window")
const ITEM_WIDTH = width / 4.5

export default function Top_Selling() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [likedProducts, setLikedProducts] = useState({})
    const navigation = useNavigation()

    const fetchProducts = useCallback(async ({ whatDisplay = "top_selling" } = {}) => {
        try {
            const response = await axios.get(`${API_V1_URL}/api/v1/get-products?${whatDisplay}=1`)
            setProducts(response.data.data)
        } catch (err) {
            console.error("Error fetching products:", err)
            setError("Error fetching products")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchProducts()
    }, [fetchProducts])

    const toggleLike = useCallback((productId) => {
        setLikedProducts((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }))
    }, [])

    const renderedProducts = useMemo(() => {
        return products.slice(0, 8).map((product, index) => (
            <TouchableOpacity
                key={product.product_id}
                style={styles.productItem}
                onPress={() => navigation.navigate('Product_info', { 
                    id: product.product_id, 
                    title: product?.product_name 
                })}
            >
                <View style={styles.imageWrapper}>
                    <Image 
                        source={{ uri: product.image_1 }}
                        style={styles.productImage}
                     
                    />
                    <TouchableOpacity style={styles.cartButton}>
                        <MaterialCommunityIcons name="cart-plus" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <Text numberOfLines={2} style={styles.productName}>
                    {product.product_name}
                </Text>
            </TouchableOpacity>
        ))
    }, [products, navigation])

    const LoadingView = useMemo(() => (
        <View style={{ width: '100%' }}>
            <CircleLoader />
        </View>
    ), [])

    const ErrorView = useMemo(() => (
        <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
        </View>
    ), [error])

    if (loading) return LoadingView
    if (error) return ErrorView

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    Top Selling Products
                </Text>
                <Text style={styles.headerSubtitle}>{products.length} items available</Text>
            </View>
            <ScrollView
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                    />
                }
            >
                <View style={styles.productGrid}>
                    {renderedProducts}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        marginBottom: 16,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,

    },
    scrollContent: {
        paddingHorizontal: 8,
    },
    productGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        width: width,
        paddingHorizontal: 4,
    },
    productItem: {
        width: ITEM_WIDTH,
        alignItems: "center",
        padding: 8,
    },
    imageWrapper: {
        position: "relative",
        width: ITEM_WIDTH - 16,
        height: ITEM_WIDTH - 16,
        borderRadius: (ITEM_WIDTH - 16) / 2,
        overflow: "hidden",
        backgroundColor: "#f3f4f6",
        marginBottom: 8,
    },
    productImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    cartButton: {
        position: "absolute",
        right: 4,
        bottom: 4,
        backgroundColor: "#007ab8",
        borderRadius: 12,
        padding: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productName: {
        fontSize: 12,
        textAlign: "center",
        color: "#1F2937",
        height: 32,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        marginTop: 8,
        fontSize: 16,
        color: "#EF4444",
        textAlign: "center",
    },
})

