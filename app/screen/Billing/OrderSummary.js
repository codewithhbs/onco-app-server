import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import RazorpayCheckout from 'react-native-razorpay';
import * as SecureStore from "expo-secure-store";
import { useDispatch } from 'react-redux'
import axios from 'axios'
import Loader from '../../components/Loader';
import { useNavigation } from '@react-navigation/native';

import useSettings from '../../hooks/Settingshook';
import { API_V1_URL } from '../../constant/API';
const OrderSummary = ({ billingData, cart }) => {
    const { address, patientInfo, orderDetails } = billingData;
    const [prescriptions, setPrescriptions] = useState([]);
    const [parseDataCome, setParsedData] = useState({});
    const { settings } = useSettings()

    const [prescriptionId, setPrescriptionId] = useState(null); // Track prescription ID
    const dispatch = useDispatch();
    const [CodAvailableOrNot, setCodAvailableOrNot] = useState(false)
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [paymentOption, setPaymentOption] = useState('Online');

    const fetchPrescriptions = async () => {
        const dat = await SecureStore.getItem('prescriptions');
        const parseData = JSON.parse(dat);
        console.log("parseDataparseData", parseData)
        setParsedData(parseData);
        setPrescriptions((prevPrescriptions) => [...prevPrescriptions, ...parseData].slice(0, 5));
        // setPrescriptions(newPrescription);
    };

    const handleSelectPaymentOption = (option) => {
        setPaymentOption(option);
    };
console.log("address",address)
    const checkUserToken = async () => {
        try {
            const data = await SecureStore.getItemAsync('token');
            const token = JSON.parse(data);
            return token;
        } catch (error) {
            console.error('Error fetching token:', error);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, [cart]);

    const renderSection = (title, content) => (
        <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>{title}</Text>
            {content}
        </View>
    );

    const handleUploadAndOrder = async () => {
        try {
            setLoading(true);


            const Rx_id = prescriptionId || await handleUploadPrescription();

            await handleOrder(Rx_id);
        } catch (error) {
            console.error('Error during upload and order process:', error.message);
        } finally {
            setLoading(false);
        }
    };



    const handleUploadPrescription = useCallback(async () => {

        setLoading(true)
        try {
            const token = await SecureStore.getItemAsync("token")
            const parsedToken = JSON.parse(token)

            if (!parsedToken) {
                setLoading(false)
                return
            }

            const formData = new FormData()
            prescriptions.forEach((image, index) => {
                console.log(image.uri)
                formData.append("prescription", {
                    uri: image.uri,
                    name: image.name,
                    type: image.type,
                })
            })

            const response = await axios.post(`${API_V1_URL}/api/v1/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${parsedToken}`,
                },
                timeout: 30000,
            })

            console.log("Server response:", response.data)
            const Rx_id = response.data?.uuid;
            console.log('Prescription uploaded successfully:', Rx_id);

            // Save the prescription ID for reuse
            setPrescriptionId(Rx_id);
            return Rx_id;

        } catch (err) {
            console.error("Upload error:", err)

            Alert.alert("Error", "Failed to upload prescriptions. Please try again.")
        } finally {

            setLoading(false)
        }
    }, [parseDataCome])

    useEffect(() => {

        const CodAvail = orderDetails?.items.some(item => item.isCOD === false) ? false : true;


        setCodAvailableOrNot(CodAvail)
    }, [orderDetails])





    const handleOrder = async (Rx_id) => {
        setLoading(true);
        try {

            if (!Rx_id) {
                Alert.alert(
                    "Missing Information",
                    "We couldn't find your prescription details. Please try uploading your prescription again."
                );
                return;
            }

            const token = await checkUserToken();
            if (!token) {
                Alert.alert(
                    "Session Expired",
                    "Looks like your session has expired. Please log in again to continue with your order."
                );
                return;
            }

            // Validate order data
            if (!patientInfo || !patientInfo.patientName || !patientInfo.patientPhone) {
                Alert.alert(
                    "Incomplete Profile",
                    "Please complete your patient profile before placing an order. We need this information to process your medicines correctly."
                );
                return;
            }


            if (!address || !address.stree_address || !address.city) {
                Alert.alert(
                    "Delivery Address Missing",
                    "Please add a complete delivery address so we know where to send your medicines."
                );
                return;
            }

            if (!cart || cart.length === 0) {
                Alert.alert(
                    "Empty Cart",
                    "Your cart is empty. Please add medicines to your cart before checkout."
                );
                return;
            }
            let updateCart = cart
            if (paymentOption === 'COD') {
                const updatedCart = {
                    ...cart,
                    totalPrice: (cart?.totalPrice || 0) + (settings?.cod_fee || 0)
                };
                updateCart = updatedCart

            }

            const orderData = {
                ...patientInfo,
                paymentOption,
                address,
                cart: updateCart,
               // shippingFee: ,
                parseDataCome,
                Rx_id,
            };
            console.log("orderData me",orderData)


            let response;
            try {
                response = await axios.post(
                   `${API_V1_URL}/api/v1/make-a-order`,
                    orderData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        timeout: 30000, // 30 seconds timeout
                    }
                );
            } catch (error) {
                if (error.response) {

                    Alert.alert(
                        "Order Processing Issue",
                        error.response.data?.message || "We're having trouble processing your order right now. Please try again in a few minutes."
                    );
                } else if (error.request) {
                    // The request was made but no response was received
                    Alert.alert(
                        "Connection Problem",
                        "We couldn't connect to our servers. Please check your internet connection and try again."
                    );
                } else {
                    // Something happened in setting up the request
                    Alert.alert(
                        "Oops!",
                        "Something unexpected happened while placing your order. Please try again."
                    );
                }
                return;
            }

            if (paymentOption === 'COD'){
                Alert.alert(
                    "Order Successful",
                    "Thank you for your order. We've sent your medicines to your delivery address. Please check your email for your confirmation."
                );
                navigation.navigate('success-screen');

            }

            // if (!response.data || !response.data.sendOrder) {
            //     Alert.alert(
            //         "Order Issue",
            //         response.data?.message || "We couldn't complete your order. Please try again or contact our support team for help."
            //     );
            //     return;
            // }

            // Handle online payment
            if (paymentOption === 'Online') {

                const order = response.data?.sendOrder;
                if (!order || !order.id || !order.amount) {
                    Alert.alert(
                        "Payment Setup Issue",
                        "We couldn't set up payment for your order. Please try again or choose a different payment method."
                    );
                    return;
                }

                // Fetch Razorpay API key
                let key;
                try {
                    const { data } = await axios.get(
                       `${API_V1_URL}/api/v1/get/api/key`,
                        { timeout: 10000 }
                    );

                    if (!data || !data.data) {
                        Alert.alert(
                            "Payment Setup Issue",
                            "We're having trouble connecting to our payment provider. Please try again in a few moments."
                        );
                        return;
                    }

                    console.log('API Key received',data);
                    key = data.data;
                } catch (keyError) {
                    console.error('Error fetching API key:', keyError);
                    Alert.alert(
                        "Payment Setup Issue",
                        "We couldn't connect to our payment gateway. Please try again or consider using Cash on Delivery."
                    );
                    return;
                }

                // Configure Razorpay options
                const options = {
                    description: 'Medicine Purchase from Onco Healthmart',
                    image: 'https://oncohealthmart.com/uploads/logo_upload/71813b13ee5896b04b92ebf44a1dee0b.png',
                    currency: 'INR',
                    key: key,
                    amount: order.amount,
                    // amount: 100,
                    name: 'Onco Healthmart',
                    order_id: order.id,
                    prefill: {
                        contact: patientInfo?.patientPhone || '',
                        name: patientInfo?.patientName || '',
                    },
                    theme: { color: '#0A95DA' },
                    retry: { enabled: true, max_count: 3 },
                };

                try {
                    // Open Razorpay payment gateway
                    const paymentData = await RazorpayCheckout.open(options);

                    if (!paymentData.razorpay_payment_id ||
                        !paymentData.razorpay_order_id ||
                        !paymentData.razorpay_signature) {
                        Alert.alert(
                            "Payment Incomplete",
                            "The payment information wasn't properly processed. No money has been deducted from your account. Please try again."
                        );
                        return;
                    }

                    // Verify payment
                    let verificationResponse;
                    try {
                        verificationResponse = await axios.post(
                            `${API_V1_URL}/api/v1/verify-payment`,
                            {
                                razorpay_payment_id: paymentData.razorpay_payment_id,
                                razorpay_order_id: paymentData.razorpay_order_id,
                                razorpay_signature: paymentData.razorpay_signature,
                            },
                            { timeout: 30000 }
                        );
                    } catch (verifyError) {
                        console.error('Payment verification error:', verifyError);
                        Alert.alert(
                            "Payment Verification Issue",
                            "We're having trouble confirming your payment. Don't worry - if your payment went through, our team will process your order. You can check the status in 'My Orders'."
                        );
                        navigation.navigate('failed_screen');
                        return;
                    }

                    console.log('Payment verification response received');

                    if (!verificationResponse.data) {
                        Alert.alert(
                            "Payment Confirmation Issue",
                            "We couldn't confirm your payment status. Our team will verify your payment and update your order status soon."
                        );
                        navigation.navigate('failed_screen');
                        return;
                    }

                    const { redirect, message } = verificationResponse.data;

                    // Handle different redirect scenarios
                    if (redirect === 'success_screen') {
                        Alert.alert(
                            "Payment Successful",
                            message || "Your payment was successful! Your medicines will be delivered soon."
                        );
                        await clearCartAndPrescriptions();
                        setPrescriptionId(null);
                        navigation.navigate('success-screen');
                    } else if (redirect === 'failed_screen') {
                        Alert.alert(
                            "Payment Unsuccessful",
                            "Your payment wasn't successful. Don't worry - no money has been deducted from your account. You can try again or choose Cash on Delivery."
                        );
                        navigation.navigate('failed_screen');
                    } else {
                        Alert.alert(
                            "Order Status Unclear",
                            "We've received your order, but we're not sure about the payment status. Our team will verify and update you soon."
                        );
                        navigation.navigate('failed_screen');
                    }
                } catch (paymentError) {
                    console.error('Payment processing error:', paymentError);
                    Alert.alert(
                        "Payment Process Interrupted",
                        "The payment process was interrupted. Don't worry - if any amount was deducted, it will be refunded within 5-7 business days."
                    );
                    navigation.navigate('failed_screen');
                }
            } else {
                // For Cash on Delivery
                await clearCartAndPrescriptions();
                navigation.navigate('success-screen');
            }
        } catch (error) {
            console.error('Order placement failed:', error);
            Alert.alert(
                "Order Process Issue",
                "We ran into an unexpected problem while processing your order. Please try again or contact our support team for help."
            );
        } finally {
            setLoading(false);
        }
    };

    // Helper function to clear cart and prescriptions
    const clearCartAndPrescriptions = async () => {
        try {
            await SecureStore.deleteItemAsync('CartItems');
            await SecureStore.deleteItemAsync('prescriptions');
            console.log('Cart and prescriptions cleared successfully');
        } catch (error) {
            console.error('Error clearing cart data:', error);
            // Non-critical error, don't show alert for this
        }
    };

    // Loading component
    if (loading) {
        return <Loader message="Processing your order... This will just take a moment. Thank you for your patience!" />;
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
                                source={{ uri: prescriptions.uri }}
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
                        <Text style={styles.priceLabel}>Total Payable Amount</Text>
                        <Text style={styles.priceValue}>₹{cart?.totalPrice.toLocaleString()}</Text>
                    </View>
                    {paymentOption === 'COD' && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>COD fee</Text>
                            <Text style={styles.priceValue}>₹{settings?.cod_fee}</Text>
                        </View>
                    )}
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>
                            {paymentOption === 'COD' ? (
                                <>
                                    ₹{(cart?.totalPrice + settings?.cod_fee).toLocaleString()}
                                </>
                            ) : (
                                <>
                                    ₹{(cart?.totalPrice).toLocaleString()}
                                </>
                            )}
                        </Text>
                    </View>
                </View>
            ))}

            {/* Payment Options */}
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


            <TouchableOpacity onPress={() => handleUploadAndOrder()} style={styles.confirmButton}>
                <Icon name="check-circle" size={24} color="#fff" />
                <Text style={styles.confirmButtonText}>Confirm Order</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default OrderSummary;
