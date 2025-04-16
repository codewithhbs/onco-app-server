import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation } from '@react-navigation/native';
import { API_V1_URL } from '../../../constant/API';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [token, setToken] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation()

    const fetchOrders = useCallback(async (token) => {
        try {
            setLoading(true);
            setRefreshing(true);

            const response = await axios.get(`${API_V1_URL}/api/v1/get-my-order`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrders(response?.data?.data ?? []);
            setError('');
        } catch (err) {
            console.error('Error fetching orders:', err.response.data.message);
            if (err.response.data.message === 'No orders found') {
                setError('No orders found. Please check your order history or try again later.');
            } else {
                setError('Failed to fetch orders. Pull down to refresh.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const data = await SecureStore.getItemAsync('token');
            const token = JSON.parse(data);
            if (token) {
                await fetchOrders(token);
            } else {
                setError('No user token found. Please log in again.');
            }
        } catch (err) {
            console.error('Error refreshing orders:', err);
            setError('Failed to refresh orders. Please try again.');
        } finally {
            setRefreshing(false);
        }
    }, [fetchOrders]);

    useEffect(() => {
        const checkUserToken = async () => {
            try {
                const data = await SecureStore.getItemAsync('token');
                const token = JSON.parse(data);
                if (token) {
                    setToken(token)
                    await fetchOrders(token);
                } else {
                    setError('No user token found. Please log in.');
                }
            } catch (err) {
                console.error('Error fetching token:', err);
                setError('Failed to fetch token. Please log in again.');
            } finally {
                setLoading(false);
            }
        };

        checkUserToken();
    }, [fetchOrders]);


    const handleRepeatOrder = async (item) => {
        const data = await SecureStore.getItemAsync('token');
        const token = JSON.parse(data);
        try {
            if (!item?.order_id) {
                alert('Invalid order. Please try again.');
                return;
            }



            const response = await axios.post(
             `${API_V1_URL}/api/v1/repeat_order/${item?.order_id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );


            if (item?.payment_option === 'Online') {
                const order = response.data?.sendOrder;
                let key;

                try {
                    const { data } = await axios.get(`${API_V1_URL}/api/v1/get/api/key`)

                    console.log("key", data);
                    if (!data) {
                        Alert.alert("Error", "Failed to fetch API key. Please try again.")
                        return
                    }
                    key = data.data
                } catch (error) {
                    console.error('Error fetching API key:', error);
                    Alert.alert("Error", "Failed to fetch API key. Please try again.")
                    return

                }
                if (!order?.amount || !order?.id) {
                    alert('Invalid payment details. Please try again.');
                    return;
                }
                if (!key) {
                    alert('Invalid API key. Please try again.')
                    return
                }

                const options = {
                    description: 'Re Order Medicine Purchase Payment Payments',
                    image: 'https://oncohealthmart.com/uploads/logo_upload/71813b13ee5896b04b92ebf44a1dee0b.png',
                    currency: 'INR',
                    key: key,
                    amount: order.amount,
                    name: 'Onco Healthmart',
                    order_id: order.id,
                    prefill: {
                        contact: order.customer_phone || '9879879877',
                        name: order.customer_name || 'User',
                    },
                    theme: { color: '#0A95DA' },
                };

                RazorpayCheckout.open(options)
                    .then((data) => {
                        // Handle successful Razorpay payment
                        axios
                            .post(`${API_V1_URL}/api/v1/verify-payment`, {
                                razorpay_payment_id: data.razorpay_payment_id,
                                razorpay_order_id: data.razorpay_order_id,
                                razorpay_signature: data.razorpay_signature,
                            })
                            .then((verificationResponse) => {
                                console.log(verificationResponse.data);
                                const { redirect, message } = verificationResponse.data;
                                if (redirect === 'success_screen') {
                                    alert(message);

                                    navigation.navigate('success-screen');
                                } else if (redirect === 'failed_screen') {
                                    navigation.navigate('failed-screen');
                                }
                            })
                            .catch((err) => {
                                console.error('Error verifying payment:', err);
                                alert('Payment verification failed!');
                            });
                    })
                    .catch((error) => {
                        console.error(`Error verifying payment: ${error}`);
                        Alert.alert(
                            "Order Canceled",
                            "If your money has been deducted, please wait. It will be refunded in 3-5 business days.",
                            [
                                {
                                    text: "OK",
                                    onPress: () => navigation.navigate("Home"),
                                    style: "default",
                                },
                            ]
                        );
                    });
            } else {
                navigation.navigate('success-screen');
            }
        } catch (error) {
            console.error('Error repeating order:', error.response.data);
            alert('Failed to repeat order. Please try again.');
        }
    };


    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return '#059669';
            case 'pending':
                return '#D97706';
            case 'cancelled':
                return '#DC2626';
            default:
                return '#6B7280';
        }
    };

    const renderOrderDetails = (order) => {
        return (
            <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Order Details</Text>
                {order.details.map((item, index) => (
                    <View key={index} style={styles.productItem}>
                        <Text style={styles.productName}>{item.product_name}</Text>
                        <Text style={styles.productQuantity}>Qty: {item.unit_quantity}</Text>
                        {/* <Text style={styles.productQuantity}>Qty: {item.isCOD === '0' ? 'Yes' : 'No'}</Text> */}
                        <Text style={styles.productPrice}>₹{item.unit_price}</Text>
                    </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>₹{order.subtotal}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total:</Text>
                        <Text style={styles.summaryTotal}>₹{order.amount}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
             <TouchableOpacity onPress={()=> navigation.goBack()} style={styles.refreshButton}>
                <Icon name="arrow-left" size={24} color="#0A95DA" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                <Icon name="refresh" size={24} color="#0A95DA" />
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.centered}>
                    <ActivityIndicator size="large" color="#0A95DA" />
                    <Text style={styles.loadingText}>Loading your orders...</Text>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {renderHeader()}

                {error ? (
                    <View style={styles.errorContainer}>
                        <Icon name="alert-circle-outline" size={48} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0A95DA"]} />}
                    >
                        <View style={styles.content}>
                            {loading ? (
                                <View style={styles.centered}>
                                    <ActivityIndicator size="large" color="#0A95DA" />
                                    <Text style={styles.loadingText}>Loading your orders...</Text>
                                </View>
                            ) : orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <View key={index} style={styles.orderCard}>
                                        <View style={styles.orderHeader}>
                                            <View>
                                                {order.transaction_number && (
                                                    <Text style={styles.orderNumber}>
                                                        Order #{order.transaction_number.substring(0, 10)}...
                                                    </Text>
                                                )}
                                                <Text style={styles.orderDate}>
                                                    {new Date(order.order_date).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            <View
                                                style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}
                                            >
                                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                                    {order.status}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.orderInfo}>
                                            <View style={styles.infoRow}>
                                                <Icon name="currency-inr" size={16} color="#4B5563" />
                                                <Text style={styles.infoText}>Amount: ₹{order.amount}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Icon name="map-marker-outline" size={16} color="#4B5563" />
                                                <Text style={styles.infoText} numberOfLines={1}>
                                                    {order.customer_shipping_address}
                                                </Text>
                                            </View>
                                        </View>

                                        {selectedOrder === order.order_id && renderOrderDetails(order)}

                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() =>
                                                    setSelectedOrder(selectedOrder === order.order_id ? null : order.order_id)
                                                }
                                            >
                                                <Icon
                                                    name={selectedOrder === order.order_id ? "chevron-up" : "chevron-down"}
                                                    size={14}
                                                    color="#0A95DA"
                                                />
                                                <Text style={styles.actionButtonText}>
                                                    {selectedOrder === order.order_id ? "Hide Details" : "View Details"}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleRepeatOrder(order)}
                                                style={[styles.actionButton, styles.repeatButton]}
                                            >
                                                <Icon name="repeat" size={14} color="#FFFFFF" />
                                                <Text style={[styles.actionButtonText, styles.repeatButtonText]}>Re-order</Text>
                                            </TouchableOpacity>

                                            {/* <TouchableOpacity style={[styles.actionButton, styles.trackButton]}>
                                                <Icon name="truck-delivery-outline" size={14} color="#059669" />
                                                <Text style={[styles.actionButtonText, styles.trackButtonText]}>Track Order</Text>
                                            </TouchableOpacity> */}
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyStateContainer}>
                                    <Image
                                        source={{ uri: "https://your-empty-state-image-url.com" }}
                                        style={styles.emptyStateImage}
                                    />
                                    <Text style={styles.emptyStateText}>No orders found</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        Your order history will appear here once you make a purchase.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    refreshButton: {
        padding: 8,
    },
    content: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    orderDate: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    orderInfo: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
        marginHorizontal: 4,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#0A95DA',
        marginLeft: 4,
    },
    repeatButton: {
        backgroundColor: '#0A95DA',
    },
    repeatButtonText: {
        color: '#FFFFFF',
    },
    trackButton: {
        backgroundColor: '#ECFDF5',
    },
    trackButtonText: {
        color: '#059669',
    },
    detailsContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productName: {
        flex: 2,
        fontSize: 14,
        color: '#4B5563',
    },
    productQuantity: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    productPrice: {
        flex: 1,
        fontSize: 14,
        color: '#1F2937',
        textAlign: 'right',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    summaryContainer: {
        marginTop: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1F2937',
    },
    summaryTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#4B5563',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#0A95DA',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },

    emptyStateImage: {
        width: 200,
        height: 200,
        marginBottom: 24,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});
