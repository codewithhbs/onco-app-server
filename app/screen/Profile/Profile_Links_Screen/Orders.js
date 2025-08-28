import { useCallback, useEffect, useState } from 'react';
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
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [token, setToken] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [reorderingOrderId, setReorderingOrderId] = useState(null);
    const navigation = useNavigation();

    const fetchOrders = useCallback(async (authToken) => {
        try {
            const response = await axios.get(`${API_V1_URL}/api/v1/get-my-order`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            setOrders(response?.data?.data ?? []);
            setError('');
        } catch (err) {
            console.error('Error fetching orders:', err?.response?.data?.message || err.message);
            if (err?.response?.data?.message === 'No orders found') {
                setError('No orders found. Please check your order history or try again later.');
            } else {
                setError('Failed to fetch orders. Pull down to refresh.');
            }
        }
    }, []);

    const onRefresh = useCallback(async () => {
        if (!token) {
            setError('No user token found. Please log in again.');
            return;
        }

        setRefreshing(true);
        try {
            await fetchOrders(token);
        } catch (err) {
            console.error('Error refreshing orders:', err);
            setError('Failed to refresh orders. Please try again.');
        } finally {
            setRefreshing(false);
        }
    }, [fetchOrders, token]);

    useEffect(() => {

        const checkUserToken = async () => {
            try {
                const data = await SecureStore.getItemAsync('token');
                if (!data) {
                    setError('No user token found. Please log in.');
                    setLoading(false);
                    return;
                }

                const parsedToken = JSON.parse(data);
                if (parsedToken) {
                    setToken(parsedToken);
                    await fetchOrders(parsedToken);
                } else {
                    setError('Invalid token. Please log in again.');
                }
            } catch (err) {
                console.error('Error fetching token:', err);
                setError('Failed to authenticate. Please log in again.');
            } finally {
                setLoading(false);
            }
        };

        checkUserToken();
    }, [fetchOrders]);

    const handleRepeatOrder = async (item) => {
        if (!token) {
            Alert.alert('Error', 'Please log in to place an order.');
            return;
        }

        if (!item?.order_id) {
            Alert.alert('Error', 'Invalid order. Please try again.');
            return;
        }
        console.log("item.status", item.status)
        if (item.status.toLowerCase() !== 'completed' && item.status.toLowerCase() !== 'shipped') {
            Alert.alert('Cannot Reorder', 'You can only reorder completed orders.');
            return;
        }


        setReorderingOrderId(item.order_id);

        try {
            const response = await axios.post(
                `${API_V1_URL}/api/v1/repeat_order/${item?.order_id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.message.includes("coupon was invalid or expired")) {
                Alert.alert(
                    'Coupon Issue',
                    'The original coupon is no longer valid or has expired. The order has been placed without the coupon discount.'
                );
            }

            if (item?.payment_option === 'Online') {
                const order = response.data?.sendOrder;

                if (!order?.amount || !order?.id) {
                    Alert.alert('Error', 'Invalid payment details. Please try again.');
                    return;
                }

                let key;
                try {
                    const { data } = await axios.get(`${API_V1_URL}/api/v1/get/api/key`);

                    if (!data?.data) {
                        Alert.alert('Error', 'Failed to fetch API key. Please try again.');
                        return;
                    }
                    key = data.data;
                } catch (error) {
                    console.error('Error fetching API key:', error);
                    Alert.alert('Error', 'Failed to fetch API key. Please try again.');
                    return;
                }

                const options = {
                    description: 'Re-Order Medicine Purchase Payment',
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
                        axios
                            .post(`${API_V1_URL}/api/v1/verify-payment`, {
                                razorpay_payment_id: data.razorpay_payment_id,
                                razorpay_order_id: data.razorpay_order_id,
                                razorpay_signature: data.razorpay_signature,
                            })
                            .then((verificationResponse) => {
                                const { redirect, message } = verificationResponse.data;
                                if (redirect === 'success_screen') {
                                    Alert.alert('Success', message);
                                    navigation.navigate('success-screen');
                                } else if (redirect === 'failed_screen') {
                                    navigation.navigate('failed-screen');
                                }
                            })
                            .catch((err) => {
                                console.error('Error verifying payment:', err);
                                Alert.alert('Error', 'Payment verification failed!');
                            });
                    })
                    .catch((error) => {
                        console.error(`Error in payment: ${error}`);
                        Alert.alert(
                            'Order Canceled',
                            'If your money has been deducted, please wait. It will be refunded in 3-5 business days.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.navigate('Home'),
                                    style: 'default',
                                },
                            ]
                        );
                    });
            } else {
                Alert.alert('Success', 'Order placed successfully!');
                navigation.navigate('success-screen');
            }
        } catch (error) {
            console.error('Error repeating order:', error?.response?.data || error.message);
            Alert.alert('Error', 'Failed to repeat order. Please try again.');
        } finally {
            setReorderingOrderId(null);
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
            case 'processing':
                return '#3B82F6';
            case 'shipped':
                return '#8B5CF6';
            default:
                return '#6B7280';
        }
    };

    const renderOrderDetails = (order) => {
        return (
            <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Order Details</Text>
                {order.details?.map((item, index) => (
                    <View key={index} style={styles.productItem}>
                        <Text style={styles.productName} numberOfLines={2}>
                            {item.product_name}
                        </Text>
                        <Text style={styles.productQuantity}>Qty: {item.unit_quantity}</Text>
                        <Text style={styles.productPrice}>₹{item.unit_price}</Text>
                    </View>
                )) || <Text style={styles.noDetailsText}>No product details available</Text>}

                <View style={styles.divider} />
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>₹{order.subtotal || 0}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Payment Method:</Text>
                        <Text style={styles.summaryValue}>{order.payment_option || 'N/A'}</Text>
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Icon name="arrow-left" size={24} color="#0A95DA" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <TouchableOpacity
                onPress={onRefresh}
                style={[styles.headerButton, refreshing && styles.disabledButton]}
                disabled={refreshing}
            >
                <Icon name="refresh" size={24} color={refreshing ? '#9CA3AF' : '#0A95DA'} />
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Icon name="package-variant" size={80} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No orders found</Text>
            <Text style={styles.emptyStateSubtext}>
                Your order history will appear here once you make a purchase.
            </Text>
            <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.shopNowButtonText}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={48} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh} disabled={refreshing}>
                {refreshing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.retryButtonText}>Retry</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    const isOrderCompleted = (status) => {
        return status.toLowerCase() === 'completed' || status.toLowerCase() === 'shipped';
    };

    if (loading) {
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

                {error ? renderErrorState() : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#0A95DA"]}
                                tintColor="#0A95DA"
                            />
                        }
                    >
                        <View style={styles.content}>
                            {orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <View key={order.order_id || index} style={styles.orderCard}>
                                        <View style={styles.orderHeader}>
                                            <View style={styles.orderHeaderLeft}>
                                                {order.transaction_number && (
                                                    <Text style={styles.orderNumber}>
                                                        Order #{order.transaction_number.substring(0, 12)}
                                                        {order.transaction_number.length > 12 && '...'}
                                                    </Text>
                                                )}
                                                <Text style={styles.orderDate}>
                                                    {new Date(order.order_date).toLocaleDateString('en-IN', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    { backgroundColor: getStatusColor(order.status) + "20" }
                                                ]}
                                            >
                                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.orderInfo}>
                                            <View style={styles.infoRow}>
                                                <Icon name="currency-inr" size={16} color="#4B5563" />
                                                <Text style={styles.infoText}>Amount: ₹{order.amount}</Text>
                                            </View>
                                            {order.customer_shipping_address && (
                                                <View style={styles.infoRow}>
                                                    <Icon name="map-marker-outline" size={16} color="#4B5563" />
                                                    <Text style={styles.infoText} numberOfLines={2}>
                                                        {order.customer_shipping_address}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {selectedOrder === order.order_id && renderOrderDetails(order)}

                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.detailsButton]}
                                                onPress={() =>
                                                    setSelectedOrder(selectedOrder === order.order_id ? null : order.order_id)
                                                }
                                            >
                                                <Icon
                                                    name={selectedOrder === order.order_id ? "chevron-up" : "chevron-down"}
                                                    size={16}
                                                    color="#0A95DA"
                                                />
                                                <Text style={styles.actionButtonText}>
                                                    {selectedOrder === order.order_id ? "Hide Details" : "View Details"}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleRepeatOrder(order)}
                                                style={[
                                                    styles.actionButton,
                                                    styles.repeatButton,
                                                    !isOrderCompleted(order.status) && styles.disabledRepeatButton
                                                ]}
                                                disabled={!isOrderCompleted(order.status) || reorderingOrderId === order.order_id}
                                            >
                                                {reorderingOrderId === order.order_id ? (
                                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                                ) : (
                                                    <Icon
                                                        name="repeat"
                                                        size={16}
                                                        color={isOrderCompleted(order.status) ? "#FFFFFF" : "#9CA3AF"}
                                                    />
                                                )}
                                                <Text
                                                    style={[
                                                        styles.actionButtonText,
                                                        styles.repeatButtonText,
                                                        !isOrderCompleted(order.status) && styles.disabledButtonText
                                                    ]}
                                                >
                                                    {reorderingOrderId === order.order_id ? 'Processing...' : 'Re-order'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : renderEmptyState()}
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
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: moderateScale(16),
        paddingVertical: verticalScale(16),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    headerTitle: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#111827',
    },
    headerButton: {
        padding: moderateScale(8),
        borderRadius: 8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    content: {
        padding: moderateScale(16),
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: moderateScale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(12),
    },
    orderHeaderLeft: {
        flex: 1,
    },
    orderNumber: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#111827',
        marginBottom: verticalScale(4),
    },
    orderDate: {
        fontSize: moderateScale(14),
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: 20,
        marginLeft: scale(8),
    },
    statusText: {
        fontSize: moderateScale(13),
        fontWeight: '600',
    },
    orderInfo: {
        marginBottom: verticalScale(16),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    infoText: {
        fontSize: moderateScale(14),
        color: '#4B5563',
        marginLeft: scale(8),
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scale(8),
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(8),
        borderRadius: 8,
        minHeight: verticalScale(44),
    },
    detailsButton: {
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    actionButtonText: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#0A95DA',
        marginLeft: scale(4),
    },
    repeatButton: {
        backgroundColor: '#0A95DA',
    },
    repeatButtonText: {
        color: '#FFFFFF',
    },
    disabledRepeatButton: {
        // backgroundColor: '#9CA3AF',
    },
    disabledButtonText: {
        color: '#FFFFFF',
    },
    detailsContainer: {
        marginTop: verticalScale(16),
        paddingTop: verticalScale(16),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    detailsTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#111827',
        marginBottom: verticalScale(12),
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: verticalScale(12),
        paddingVertical: verticalScale(8),
        backgroundColor: '#F9FAFB',
        paddingHorizontal: scale(12),
        borderRadius: 8,
    },
    productName: {
        flex: 2,
        fontSize: moderateScale(14),
        color: '#374151',
        fontWeight: '500',
    },
    productQuantity: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#6B7280',
        textAlign: 'center',
    },
    productPrice: {
        flex: 1,
        fontSize: moderateScale(14),
        color: '#111827',
        textAlign: 'right',
        fontWeight: '600',
    },
    noDetailsText: {
        fontSize: moderateScale(14),
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: verticalScale(16),
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: verticalScale(16),
    },
    summaryContainer: {
        gap: verticalScale(8),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: moderateScale(14),
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: moderateScale(14),
        color: '#374151',
        fontWeight: '500',
    },
    summaryTotal: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#111827',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: moderateScale(16),
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: moderateScale(16),
        color: '#6B7280',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(24),
    },
    errorText: {
        fontSize: moderateScale(16),
        color: '#DC2626',
        textAlign: 'center',
        marginTop: verticalScale(16),
        marginBottom: verticalScale(24),
        lineHeight: moderateScale(24),
    },
    retryButton: {
        backgroundColor: '#0A95DA',
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(12),
        borderRadius: 8,
        minWidth: scale(100),
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(60),
        paddingHorizontal: moderateScale(24),
    },
    emptyStateText: {
        fontSize: moderateScale(20),
        fontWeight: '600',
        color: '#374151',
        marginTop: verticalScale(24),
        marginBottom: verticalScale(8),
    },
    emptyStateSubtext: {
        fontSize: moderateScale(15),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: moderateScale(22),
        marginBottom: verticalScale(32),
    },
    shopNowButton: {
        backgroundColor: '#0A95DA',
        paddingHorizontal: scale(32),
        paddingVertical: verticalScale(14),
        borderRadius: 8,
    },
    shopNowButtonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
});