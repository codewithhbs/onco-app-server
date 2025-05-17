import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Adjusted for better spacing

export default function SimilarProducts({ id, salt }) {
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        fetchSimilarProducts();
    }, [id, salt]);

    const fetchSimilarProducts = async () => {
        try {
            const response = await axios.get(
                `http://192.168.1.17:9500/api/v1/medicne/by-salt?salt=${encodeURIComponent(salt)}&id=${id}`
            );
            setSimilarProducts(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to load similar products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRediect = (id, name) => {
       
        navigation.navigate('Product_info', {
            id: id,
            title: name
        })
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Icon name="alert-circle-outline" size={48} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!similarProducts.length) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Similar Products</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All</Text>
                    <Icon name="chevron-right" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.productsGrid}>
                    {similarProducts.map(item => {
                        const discountPercentage = Math.round(
                            ((item.product_mrp - item.product_sp) / item.product_mrp) * 100
                        );

                        return (
                            <TouchableOpacity
                                key={item.product_id.toString()}
                                onPress={() => handleRediect(item?.product_id, item.name)}
                                style={styles.productCard}
                                activeOpacity={0.79}
                            >
                                <View style={styles.imageContainer}>
                                    {item.image_1 ? (
                                        <Image
                                            source={{ uri: item.image_1 }}
                                            style={styles.productImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View style={styles.productImagePlaceholder}>
                                            {/* You can add a default image or placeholder here if needed */}
                                            <Text>No Image</Text>
                                        </View>
                                    )}

                                    {discountPercentage > 0 && (
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountText}>{discountPercentage}%</Text>
                                        </View>
                                    )}
                                    {item.presciption_required === 'Yes' && (
                                        <View style={styles.prescriptionBadge}>
                                            <Icon name="prescription" size={12} color="#3b82f6" />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.contentContainer}>
                                    <Text numberOfLines={1} style={styles.productName}>
                                        {item.product_name}
                                    </Text>

                                    <Text style={styles.companyName} numberOfLines={1}>
                                        {item.company_name}
                                    </Text>

                                    <View style={styles.priceInfoContainer}>
                                        <View style={styles.priceWrapper}>
                                            <Text style={styles.price}>₹{item.product_sp}</Text>
                                            <Text style={styles.mrp}>₹{item.product_mrp}</Text>
                                        </View>

                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 14,
        color: '#3b82f6',
        marginRight: 4,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    productCard: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: CARD_WIDTH - 40,
        backgroundColor: '#f8fafc',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#3b82f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    discountText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    prescriptionBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#eff6ff',
        padding: 6,
        borderRadius: 8,
    },
    contentContainer: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
        lineHeight: 20,
    },
    companyName: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
    },
    priceInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    priceWrapper: {
        flex: 1,
        marginRight: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    mrp: {
        fontSize: 10,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    quantity: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'right',
        maxWidth: '40%',
    },
    centered: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        marginTop: 8,
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
    },
});