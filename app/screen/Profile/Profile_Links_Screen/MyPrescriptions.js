import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,

    Image,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Modal,
    Dimensions,
    Animated,
    ScrollView,
    Platform,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { API_V1_URL } from "../../../constant/API";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const ImageSlider = ({ images, visible, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = new Animated.Value(0);

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>

                    <Text style={styles.modalTitle}>Prescription Images</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false } // `useNativeDriver: true` is not supported for `onScroll`
                    )}
                    onMomentumScrollEnd={(e) => {
                        setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
                    }}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {images.map((item, index) => (
                        <View key={index} style={styles.slideContainer}>
                            <Image source={{ uri: item }} style={styles.slideImage} resizeMode="contain" />
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.pagination}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                currentIndex === index && styles.paginationDotActive,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                        {currentIndex + 1} / {images.length}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const PrescriptionItem = ({ item }) => {
    const [showSlider, setShowSlider] = useState(false);
    const images = [item.image_1, item.image_2, item.image_3, item.image_4, item.image_5].filter(Boolean);

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return { bg: "#FFF7ED", text: "#EA580C" };
            case "cancelled":
                return { bg: "#FEF2F2", text: "#DC2626" };
            case "completed":
                return { bg: "#F0FDF4", text: "#16A34A" };
            default:
                return { bg: "#F3F4F6", text: "#4B5563" };
        }
    };

    const statusStyle = getStatusColor(item.prescription_status);

    return (
        <View style={styles.prescriptionItem}>
            <View style={styles.prescriptionHeader}>
                <View>
                    <Text style={styles.prescriptionId}>{item.genreate_presc_order_id}</Text>
                    <Text style={styles.prescriptionDate}>
                        <Icon name="calendar" size={14} color="#6B7280" /> {formatDate(item.date)}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {item.prescription_status.toUpperCase()}
                    </Text>
                </View>
            </View>

            {item.prescription_status !== 'completed' && item.cancel_reason && (
                <View style={styles.reasonContainer}>
                    <Icon name="alert-circle-outline" size={18} color="#DC2626" />
                    <Text style={styles.reasonText}>{item.cancel_reason}</Text>
                </View>
            )}

            {item.prescription_status === 'completed' && (
                <View style={[styles.reasonContainer, { backgroundColor: '#d0eddb' }]}>
                    <Icon name="check-outline" size={18} color="#16A34A" />
                    <Text style={[styles.reasonText, { color: '#021007' }]}>{item.cancel_reason}</Text>
                </View>
            )}

            <View style={styles.thumbnailContainer}>
                {images.slice(0, 3).map((image, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setShowSlider(true)}
                        style={styles.thumbnail}
                    >
                        <Image source={{ uri: image }} style={styles.thumbnailImage} />
                        {index === 2 && images.length > 3 && (
                            <View style={styles.moreOverlay}>
                                <Text style={styles.moreText}>+{images.length - 3}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => setShowSlider(true)}
            >
                <Icon name="image-multiple" size={20} color="#0A95DA" />
                <Text style={styles.viewDetailsText}>View All Images</Text>
            </TouchableOpacity>

            <ImageSlider
                images={images}
                visible={showSlider}
                onClose={() => setShowSlider(false)}
            />
        </View>
    );
};

const MyPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation()

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const tokenData = await SecureStore.getItemAsync("token");
            const token = tokenData ? JSON.parse(tokenData) : null;

            if (!token) {
                throw new Error("No token found");
            }

            const response = await axios.get(`${API_V1_URL}/api/v1/get-my-presc`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const sortedPrescriptions = response.data.data.reverse()
            setPrescriptions(sortedPrescriptions);
        } catch (err) {
            if (err.response.data.message === "No prescriptions found") {
                setPrescriptions([]);
            } else {
                setError(err.response.data.message);
            }
            // console.log(err.response.data.message)
            // setError(err.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0A95DA" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Icon name="alert-circle-outline" size={48} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          {Platform.OS === "ios" ? (
              <View style={styles.Iosheader}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.title}>
                  <Icon name="arrow-left" size={24} color="#000" />
              </TouchableOpacity>
             <View>
             <Text style={styles.title}>My Prescriptions</Text>
             <Text style={styles.subtitle}>{prescriptions.length} prescriptions found</Text>
             </View>
          </View>
          ):(
            <View style={styles.header}>
           
      
           <Text style={styles.title}>My Prescriptions</Text>
           <Text style={styles.subtitle}>{prescriptions.length} prescriptions found</Text>
         
        </View>
          )}
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {prescriptions.map((item) => (
                    <PrescriptionItem key={item.uuid} item={item} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
     
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    Iosheader:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111827",
    },
    listContent: {
        paddingVertical: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        padding: 16,
    },
    prescriptionItem: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    prescriptionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    prescriptionId: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    prescriptionDate: {
        fontSize: 14,
        color: "#6B7280",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    reasonContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    reasonText: {
        fontSize: 14,
        color: "#DC2626",
        marginLeft: 8,
        flex: 1,
    },
    thumbnailContainer: {
        flexDirection: "row",
        marginBottom: 12,
    },
    thumbnail: {
        flex: 1,
        aspectRatio: 1,
        marginRight: 8,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
    },
    thumbnailImage: {
        width: "100%",
        height: "100%",
    },
    moreOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    moreText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    viewDetailsButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        marginTop: 8,
    },
    viewDetailsText: {
        color: "#0A95DA",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
    },
    errorText: {
        color: "#DC2626",
        fontSize: 16,
        textAlign: "center",
        marginTop: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#000000",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    closeButton: {
        padding: 8,
    },
    scrollContainer: {
        flexDirection: 'row',
    },
    slideContainer: {
        width,
        height: height - 100,
        justifyContent: "center",
        alignItems: "center",
    },
    slideImage: {
        width: width - 32,
        height: height - 200,
        borderRadius: 12,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 40,
        width: "100%",
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: "#FFFFFF",
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    imageCounter: {
        position: "absolute",
        bottom: 16,
        right: 16,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    imageCounterText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default MyPrescriptions;