import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import RazorpayCheckout from 'react-native-razorpay';
import * as SecureStore from "expo-secure-store";
import { useDispatch } from 'react-redux';
import axios from 'axios';
import Loader from '../../components/Loader';
import { useNavigation } from '@react-navigation/native';
import useSettings from '../../hooks/Settingshook';
import { API_V1_URL } from '../../constant/API';

const OrderSummary = ({ billingData, cart }) => {
    const { address, patientInfo, orderDetails } = billingData;
    const [prescriptions, setPrescriptions] = useState([]);
    const [parseDataCome, setParsedData] = useState({});
    const { settings } = useSettings();
    const [prescriptionId, setPrescriptionId] = useState(null);
    const dispatch = useDispatch();
    const [CodAvailableOrNot, setCodAvailableOrNot] = useState(false);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [paymentOption, setPaymentOption] = useState('Online');
    const [couponData, setCouponData] = useState({ discount: 0, grandTotal: cart?.totalPrice || 0 });

    const fetchPrescriptions = async () => {
        try {
            const dat = await SecureStore.getItem('prescriptions');
            const parseData = JSON.parse(dat) || [];
            setParsedData(parseData);
            setPrescriptions([...parseData].slice(0, 5));
        } catch (error) {
            Alert.alert('Error', 'Failed to load prescriptions. Please try again.');
        }
    };

    const checkUserToken = async () => {
        try {
            const data = await SecureStore.getItemAsync('token');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    };

    const validateCoupon = useCallback(async () => {
        if (!cart?.couponCode) return;
        setLoading(true);
        try {
            const token = await checkUserToken();
            if (!token) throw new Error('No token found');
            
            const response = await axios.post(
                `${API_V1_URL}/api/v1/check-coupon`,
                {
                    couponCode: cart.couponCode,
                    ProductsFromCart: cart.items,
                    totalPrice: cart.totalPrice,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                }
            );

            if (response.data.success) {
                setCouponData({
                    discount: response.data.discount,
                    grandTotal: response.data.grandTotal,
                });
            } else {
                setCouponData({ discount: 0, grandTotal: cart.totalPrice });
                Alert.alert('Coupon Error', response.data.message);
            }
        } catch (error) {
            setCouponData({ discount: 0, grandTotal: cart.totalPrice });
            Alert.alert('Coupon Error', 'Failed to validate coupon. Proceeding without discount.');
        } finally {
            setLoading(false);
        }
    }, [cart]);

    useEffect(() => {
        fetchPrescriptions();
        validateCoupon();
    }, [cart, validateCoupon]);

    useEffect(() => {
        const CodAvail = orderDetails?.items.every(item => item.isCOD !== false);
        setCodAvailableOrNot(CodAvail);
    }, [orderDetails]);

    const renderSection = (title, content) => (
        <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>{title}</Text>
            {content}
        </View>
    );

    const handleUploadPrescription = useCallback(async () => {
        setLoading(true);
        try {
            const token = await checkUserToken();
            if (!token) throw new Error('No token found');

            const formData = new FormData();
            prescriptions.forEach((image, index) => {
                formData.append("prescription", {
                    uri: image.uri,
                    name: image.name,
                    type: image.type,
                });
            });

            const response = await axios.post(
                `${API_V1_URL}/api/v1/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 30000,
                }
            );

            const Rx_id = response.data?.uuid;
            setPrescriptionId(Rx_id);
            return Rx_id;
        } catch (err) {
            Alert.alert("Error", "Failed to upload prescriptions. Please try again.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [prescriptions]);

    const handleOrder = async (Rx_id) => {
        setLoading(true);
        try {
            if (!Rx_id) {
                throw new Error("Missing prescription ID");
            }

            const token = await checkUserToken();
            if (!token) {
                throw new Error("Session Expired");
            }

            if (!patientInfo?.patientName || !patientInfo?.patientPhone) {
                throw new Error("Incomplete patient profile");
            }

            if (!address?.stree_address || !address?.city) {
                throw new Error("Incomplete delivery address");
            }

            if (!cart?.items?.length) {
                throw new Error("Empty cart");
            }

            const updatedCart = {
                ...cart,
                totalPrice: paymentOption === 'COD' ? cart.totalPrice + (settings?.cod_fee || 0) : cart.totalPrice,
                discount: couponData.discount,
                grandTotal: couponData.grandTotal + (paymentOption === 'COD' ? settings?.cod_fee || 0 : 0),
            };

            const orderData = {
                ...patientInfo,
                paymentOption,
                address,
                cart: updatedCart,
                parseDataCome,
                Rx_id,
            };

            const response = await axios.post(
                `${API_V1_URL}/api/v1/make-a-order`,
                orderData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 30000,
                }
            );

            if (paymentOption === 'COD') {
                Alert.alert(
                    "Order Successful",
                    "Thank you for your order. We've sent your medicines to your delivery address. Please check your email for your confirmation."
                );
                await clearCartAndPrescriptions();
                navigation.navigate('success-screen');
                return;
            }

            const order = response.data?.sendOrder;
            if (!order?.id || !order?.amount) {
                throw new Error("Invalid order data from server");
            }

            const { data } = await axios.get(`${API_V1_URL}/api/v1/get/api/key`, { timeout: 10000 });
            const key = data?.data;
            if (!key) {
                throw new Error("Failed to fetch Razorpay API key");
            }

            const options = {
                description: 'Medicine Purchase from Onco Healthmart',
                image: 'https://oncohealthmart.com/uploads/logo_upload/71813b13ee5896b04b92ebf44a1dee0b.png',
                currency: 'INR',
                key,
                amount: order.amount,
                name: 'Onco Healthmart',
                order_id: order.id,
                prefill: {
                    contact: patientInfo?.patientPhone || '',
                    name: patientInfo?.patientName || '',
                },
                theme: { color: '#0A95DA' },
                retry: { enabled: true, max_count: 3 },
            };

            const paymentData = await RazorpayCheckout.open(options);
            if (!paymentData.razorpay_payment_id || !paymentData.razorpay_order_id || !paymentData.razorpay_signature) {
                throw new Error("Incomplete payment data");
            }

            const verificationResponse = await axios.post(
                `${API_V1_URL}/api/v1/verify-payment`,
                {
                    razorpay_payment_id: paymentData.razorpay_payment_id,
                    razorpay_order_id: paymentData.razorpay_order_id,
                    razorpay_signature: paymentData.razorpay_signature,
                },
                { timeout: 30000 }
            );

            const { redirect, message } = verificationResponse.data;
            if (redirect === 'success_screen') {
                Alert.alert("Payment Successful", message || "Your payment was successful! Your medicines will be delivered soon.");
                await clearCartAndPrescriptions();
                setPrescriptionId(null);
                navigation.navigate('success-screen');
            } else {
                Alert.alert("Payment Unsuccessful", message || "Your payment wasn't successful. Please try again or choose Cash on Delivery.");
                navigation.navigate('failed_screen');
            }
        } catch (error) {
            Alert.alert(
                error.message.includes("Session Expired") ? "Session Expired" :
                error.message.includes("Incomplete patient profile") ? "Incomplete Profile" :
                error.message.includes("Incomplete delivery address") ? "Delivery Address Missing" :
                error.message.includes("Empty cart") ? "Empty Cart" :
                error.message.includes("Invalid order data") ? "Order Issue" :
                error.message.includes("Razorpay API key") ? "Payment Setup Issue" :
                error.message.includes("Incomplete payment data") ? "Payment Incomplete" :
                "Order Process Issue",
                error.message.includes("Session Expired") ? "Please log in again to continue with your order." :
                error.message.includes("Incomplete patient profile") ? "Please complete your patient profile before placing an order." :
                error.message.includes("Incomplete delivery address") ? "Please add a complete delivery address." :
                error.message.includes("Empty cart") ? "Your cart is empty. Please add medicines to your cart." :
                error.message.includes("Invalid order data") ? "We couldn't set up payment for your order. Please try again." :
                error.message.includes("Razorpay API key") ? "We couldn't connect to our payment gateway. Please try again." :
                error.message.includes("Incomplete payment data") ? "The payment information wasn't properly processed. Please try again." :
                "An unexpected problem occurred while processing your order. Please try again or contact support"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUploadAndOrder = async () => {
        try {
            setLoading(true);
            const Rx_id = prescriptionId || await handleUploadPrescription();
            await handleOrder(Rx_id);
        } catch (error) {
            Alert.alert("Error", "Failed to process order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const clearCartAndPrescriptions = async () => {
        try {
            await SecureStore.deleteItemAsync('CartItems');
            await SecureStore.deleteItemAsync('prescriptions');
        } catch (error) {
        }
    };

    if (loading) {
        return <Loader message="Processing your order..." />;
    }

    return (
        <ScrollView style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            {renderSection('Delivery Address', (
                <View style={styles.addressCard}>
                    <Text style={styles.addressText}>
                        {address.house_no}, {address.stree_address}
                    </Text>
                    <Text style={styles.addressLocation}>
                        {address.city}, {address.state} - {address.pincode}
                    </Text>
                </View>
            ))}

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Image
                                source={{ uri: prescriptions[0]?.uri }}
                                style={styles.modalImage}
                            />
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                                <Icon name="close" size={30} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {renderSection('Patient Details', (
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Name:</Text>
                        <Text style={styles.detailValue}>{patientInfo.patientName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Phone:</Text>
                        <Text style={styles.detailValue}>{patientInfo.patientPhone}</Text>
                    </View>
                    {patientInfo.hospitalName && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Hospital:</Text>
                            <Text style={styles.detailValue}>{patientInfo.hospitalName}</Text>
                        </View>
                    )}
                    {patientInfo.doctorName && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Doctor:</Text>
                            <Text style={styles.detailValue}>{patientInfo.doctorName}</Text>
                        </View>
                    )}
                </View>
            ))}

            {renderSection('Price Details', (
                <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Subtotal</Text>
                        <Text style={styles.priceValue}>₹{cart?.totalPrice.toLocaleString()}</Text>
                    </View>
                    {cart?.couponCode && couponData.discount > 0 && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Coupon ({cart.couponCode})</Text>
                            <Text style={[styles.priceValue, { color: '#4CAF50' }]}>-₹{couponData.discount.toLocaleString()}</Text>
                        </View>
                    )}
                    {paymentOption === 'COD' && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>COD Fee</Text>
                            <Text style={styles.priceValue}>₹{settings?.cod_fee?.toLocaleString()}</Text>
                        </View>
                    )}
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>
                            ₹{couponData.grandTotal + (paymentOption === 'COD' ? settings?.cod_fee || 0 : 0).toLocaleString()}
                        </Text>
                    </View>
                </View>
            ))}

            <View style={styles.paymentOptions}>
                <TouchableOpacity
                    style={[
                        styles.paymentOption,
                        paymentOption === 'Online' && styles.activeOption,
                    ]}
                    onPress={() => handleSelectPaymentOption('Online')}
                >
                    <Icon name="contactless-payment" size={24} color="#fff" />
                    <Text style={styles.paymentOptionLabel}>Online</Text>
                </TouchableOpacity>
                {CodAvailableOrNot && (
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentOption === 'COD' && styles.activeOption,
                        ]}
                        onPress={() => handleSelectPaymentOption('COD')}
                    >
                        <Icon name="truck-delivery" size={24} color="#fff" />
                        <Text style={styles.paymentOptionLabel}>COD</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity onPress={handleUploadAndOrder} style={styles.confirmButton}>
                <Icon name="check-circle" size={24} color="#fff" />
                <Text style={styles.confirmButtonText}>Confirm Order</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default OrderSummary;