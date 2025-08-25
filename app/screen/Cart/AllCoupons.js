"use client"

import {
    View,
    Text,
    Animated,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
    Alert,
} from "react-native"
import { useEffect, useRef, useState, useCallback } from "react"
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons"
import axios from "axios"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { API_V1_URL } from "../../constant/API"

const { width } = Dimensions.get("window")

export default function AllCoupons() {
    const route = useRoute()
    const navigation = useNavigation()
    const onApply = route.params?.onApply
    const onRemove = route.params?.onRemove
    const alreadyApplies = route.params?.alreadyApplies

    const [coupons, setCoupons] = useState([])
    const [selectedCoupon, setSelectedCoupon] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [manualCoupon, setManualCoupon] = useState("")
    const [error, setError] = useState("")
    const [showAppliedInfo, setShowAppliedInfo] = useState(false)

    const slideAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(0.9)).current
    const infoAnim = useRef(new Animated.Value(0)).current

    const fetch_data = useCallback(async () => {
        setLoading(true)
        try {
            setError("")
            const { data } = await axios.get(`${API_V1_URL}/api/v1/check_coupons`)
            setCoupons(data.data)
        } catch (error) {
            console.log(error)
            setError("Unable to load coupons. Please try again.")
        } finally {
            setRefreshing(false)
            setLoading(false)
        }
    }, [])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetch_data()
    }, [fetch_data])

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start()
    }, [slideAnim, scaleAnim])

    useEffect(() => {
        fetch_data()
    }, [fetch_data])

    useEffect(() => {
        if (alreadyApplies) {
            setSelectedCoupon(alreadyApplies.CODE)
            setShowAppliedInfo(true)

            // Animate the applied info banner
            Animated.timing(infoAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start()
        } else {
            setSelectedCoupon(null)
        }
    }, [alreadyApplies, infoAnim])

    const applyCoupon = useCallback(
        (coupon) => {
            if (!onApply) {
                Alert.alert("Error", "Cannot apply coupon at this time")
                return
            }

            setSelectedCoupon(coupon.CODE)
            onApply(coupon)
            setManualCoupon("")

            // Show success message
            Alert.alert("Coupon Applied", `${coupon.CODE} has been applied to your order.`, [
                { text: "OK", onPress: () => navigation.goBack() },
            ])
        },
        [onApply, navigation],
    )

    const handleManualCouponApply = useCallback(() => {
        if (!manualCoupon.trim()) {
            setError("Please enter a coupon code")
            return
        }

        const coupon = coupons.find((c) => c.CODE === manualCoupon.toUpperCase())
        if (coupon) {
            applyCoupon(coupon)
            setError("")
        } else {
            setError("Invalid coupon code")
            // Shake animation for error
            Animated.sequence([
                Animated.timing(slideAnim, { toValue: 1.03, duration: 100, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 1.03, duration: 100, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start()
        }
    }, [manualCoupon, coupons, applyCoupon, slideAnim])

    const removeCoupon = useCallback(() => {
        if (!onRemove) {
            Alert.alert("Error", "Cannot remove coupon at this time")
            return
        }

        setSelectedCoupon(null)
        setShowAppliedInfo(false)
        onRemove()
        navigation.goBack()

        Animated.timing(infoAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }, [onRemove, infoAnim])

    const renderCouponItem = useCallback(
        (item) => {
            const isSelected = selectedCoupon === item.CODE

            return (
                <Animated.View
                    key={item.id}
                    style={[
                        styles.couponContainer,
                        {
                            opacity: slideAnim,
                            transform: [{ scale: scaleAnim }],
                            borderColor: isSelected ? item.theme || "#0A95DA" : "#E5E7EB",
                            borderWidth: isSelected ? 2 : 1,
                        },
                    ]}
                >
                    {isSelected && (
                        <View style={styles.appliedBadge}>
                            <FontAwesome5 name="check-circle" size={14} color="#FFFFFF" />
                            <Text style={styles.appliedText}>APPLIED</Text>
                        </View>
                    )}

                    <View style={styles.couponContent}>
                        {/* Left side - Discount info */}
                        <View style={styles.couponLeft}>
                            <View style={[styles.discountBadge, { backgroundColor: item.theme || "#0A95DA" }]}>
                                <MaterialCommunityIcons
                                    name={item?.discount_type == 'Percentage' ? "percent" : "truck-check"}
                                    size={16}
                                    color="#000"
                                />
                                <Text style={styles.discountText}>
                                    {/* {item?.percenatge_off ? `${item.percenatge_off}% OFF` : "Free Delivery"} */}
                                {item?.discount_type == 'Percentage'
                                        ? `${item.percenatge_off}% OFF`
                                        : item?.discount_type == 'Fixed'
                                            ?`₹${item.percenatge_off ?? 0} OFF`
                                            :"Free Delivery"
                                            }
                                </Text>
                            </View>

                            <Text style={styles.description}>{item.desc_code}</Text>

                            <View style={styles.infoRow}>
                                {item?.maxDiscount && (
                                    <>
                                        <Text style={styles.infoText}>Up to ₹{item.maxDiscount}</Text>
                                        <View style={styles.dot} />
                                    </>
                                )}
                                <Text style={styles.infoText}>Min order ₹{item.min_order_value}</Text>
                            </View>
                        </View>

                        {/* Right side - Code and apply button */}
                        <View style={styles.couponRight}>
                            <View style={styles.codeBorder}>
                                <Text style={styles.codeText}>{item.CODE}</Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.applyButton,
                                    {
                                        backgroundColor: isSelected ? "#E5E7EB" : item.theme || "#0A95DA",
                                    },
                                ]}
                                onPress={() => (isSelected ? removeCoupon() : applyCoupon(item))}
                            >
                                <Text style={[styles.applyButtonText, { color: isSelected ? "#374151" : "#FFFFFF" }]}>
                                    {isSelected ? "REMOVE" : "APPLY"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Coupon edge design */}
                    <View style={styles.leftEdge}>
                        {[...Array(8)].map((_, i) => (
                            <View key={i} style={styles.circle} />
                        ))}
                    </View>
                    <View style={styles.rightEdge}>
                        {[...Array(8)].map((_, i) => (
                            <View key={i} style={styles.circle} />
                        ))}
                    </View>
                </Animated.View>
            )
        },
        [selectedCoupon, slideAnim, scaleAnim, applyCoupon, removeCoupon],
    )

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0A95DA" />
                <Text style={styles.loadingText}>Loading coupons...</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Header with back button */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <MaterialCommunityIcons name="ticket-percent" size={24} color="#0A95DA" />
                        <Text style={styles.title}>Available Offers</Text>
                    </View>

                    {selectedCoupon && (
                        <TouchableOpacity style={styles.clearButton} onPress={removeCoupon}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#6B7280" />
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Applied coupon info banner */}
                {showAppliedInfo && alreadyApplies && (
                    <Animated.View
                        style={[
                            styles.appliedInfoBanner,
                            {
                                opacity: infoAnim,
                                transform: [
                                    {
                                        translateY: infoAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.appliedInfoContent}>
                            <FontAwesome5 name="info-circle" size={18} color="#0A95DA" />
                            <View style={styles.appliedInfoText}>
                                <Text style={styles.appliedInfoTitle}>Coupon "{alreadyApplies.CODE}" is applied</Text>
                                <Text style={styles.appliedInfoDescription}>
                                    {alreadyApplies.percenatge_off
                                        ? `You're saving ${alreadyApplies.percenatge_off}% on your order`
                                        : "You have free delivery on this order"}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.appliedInfoRemove} onPress={removeCoupon}>
                            <Text style={styles.appliedInfoRemoveText}>REMOVE</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Manual coupon input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="ticket-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter coupon code"
                        value={manualCoupon}
                        onChangeText={setManualCoupon}
                        autoCapitalize="characters"
                    />
                    <TouchableOpacity
                        style={[styles.applyManualButton, !manualCoupon.trim() && styles.applyManualButtonDisabled]}
                        onPress={handleManualCouponApply}
                        disabled={!manualCoupon.trim()}
                    >
                        <Text style={styles.applyManualButtonText}>APPLY</Text>
                    </TouchableOpacity>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Divider with text */}
                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR SELECT A COUPON</Text>
                    <View style={styles.divider} />
                </View>

                {/* Coupons list */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0A95DA"]} tintColor="#0A95DA" />
                    }
                >
                    {coupons.length > 0 ? (
                        coupons.map((item) => renderCouponItem(item))
                    ) : (
                        <View style={styles.emptyCoupons}>
                            <FontAwesome5 name="percentage" size={50} color="#000" />
                            <Text style={styles.emptyText}>{error || "No coupons available at the moment"}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetch_data}>
                                <Text style={styles.retryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#6B7280",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 8,
        color: "#1F2937",
    },
    clearButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
    },
    clearText: {
        marginLeft: 4,
        color: "#6B7280",
        fontSize: 14,
    },
    appliedInfoBanner: {
        backgroundColor: "#E1F5FE",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeftWidth: 4,
        borderLeftColor: "#0A95DA",
    },
    appliedInfoContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    appliedInfoText: {
        marginLeft: 12,
        flex: 1,
    },
    appliedInfoTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#0A95DA",
    },
    appliedInfoDescription: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },
    appliedInfoRemove: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#0A95DA",
        borderRadius: 4,
    },
    appliedInfoRemoveText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    inputContainer: {
        flexDirection: "row",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        alignItems: "center",
    },
    inputIcon: {
        marginLeft: 12,
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 16,
    },
    applyManualButton: {
        backgroundColor: "#0A95DA",
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    applyManualButtonDisabled: {
        backgroundColor: "#9CA3AF",
    },
    applyManualButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 14,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 14,
        marginLeft: 6,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    dividerText: {
        paddingHorizontal: 12,
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
    },
    listContainer: {
        paddingBottom: 20,
    },
    couponContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        position: "relative",
        overflow: "hidden",
    },
    appliedBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#10B981",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomLeftRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        zIndex: 1,
    },
    appliedText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "bold",
        marginLeft: 4,
    },
    couponContent: {
        flexDirection: "row",
        padding: 16,
    },
    couponLeft: {
        flex: 1,
        marginRight: 8,
    },
    couponRight: {
        justifyContent: "space-between",
        alignItems: "center",
    },
    discountBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
        marginBottom: 8,
    },
    discountText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 12,
        marginLeft: 4,
    },
    description: {
        fontSize: 14,
        color: "#1F2937",
        marginBottom: 8,
        fontWeight: "500",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoText: {
        fontSize: 12,
        color: "#6B7280",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#9CA3AF",
        marginHorizontal: 6,
    },
    codeBorder: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderStyle: "dashed",
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
    },
    codeText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#374151",
    },
    applyButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    applyButtonText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    leftEdge: {
        position: "absolute",
        left: -8,
        top: "50%",
        height: "100%",
        justifyContent: "space-evenly",
        marginTop: -40,
    },
    rightEdge: {
        position: "absolute",
        right: -8,
        top: "50%",
        height: "100%",
        justifyContent: "space-evenly",
        marginTop: -40,
    },
    circle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#F9FAFB",
    },
    emptyCoupons: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        color: "#6B7280",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#0A95DA",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
})
