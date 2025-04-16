import { useState, useCallback, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform, Linking } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import * as ImagePicker from "expo-image-picker"
import * as SecureStore from "expo-secure-store"
import UploadModal from "./UploadModal"
import ImagePreview from "./ImagePreview"
import RegistrationModal from "./RegistrationModal"
import SuccessModal from "./SuccessModal"
import axios from "axios"
import { useNavigation } from "@react-navigation/native"
import { API_V1_URL } from "../../constant/API"

const PrescriptionUpload = () => {
    const navigation = useNavigation()
    const [images, setImages] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [registrationModalVisible, setRegistrationModalVisible] = useState(false)
    const [successModalVisible, setSuccessModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [uploadedPrescriptions, setUploadedPrescriptions] = useState([])
    const [IdPrescriptions, setIdPrescriptions] = useState('')

  
const handleUpload = useCallback(async () => {
    try {
        const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== "granted") {
            if (canAskAgain) {
                Alert.alert(
                    "Permission Required",
                    "We need access to your photo gallery to let you upload images.",
                    [
                        {
                            text: "Retry",
                            onPress: () => handleUpload(), // Retry
                        },
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                    ]
                )
            } else {
                Alert.alert(
                    "Permission Denied",
                    "Photo library access is disabled. Please enable it from your device settings.",
                    [
                        {
                            text: "Open Settings",
                            onPress: () => {
                                if (Platform.OS === "ios") {
                                    Linking.openURL("app-settings:")
                                } else {
                                    Linking.openSettings()
                                }
                            },
                        },
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                    ]
                )
            }
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsMultipleSelection: true,
            selectionLimit: 5,
        })

        if (!result.canceled) {
            const newImages = result.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.fileName || `image-${Date.now()}.jpg`,
                type: asset.mimeType || "image/jpeg",
            }))
            setImages((prev) => [...prev, ...newImages].slice(0, 5))
            setModalVisible(false)
        }
    } catch (error) {
        setError("Error selecting images. Please try again.")
        console.error("Error selecting images:", error)
    }
}, [])

    const handleCamera = useCallback(async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== "granted") {
                Alert.alert("Permission Denied", "We need permission to access your camera.")
                return
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            })

            if (!result.canceled) {
                const newImage = {
                    uri: result.assets[0].uri,
                    name: result.assets[0].fileName || `image-${Date.now()}.jpg`,
                    type: result.assets[0].mimeType || "image/jpeg",
                }
                setImages((prev) => [...prev, newImage].slice(0, 5))
                setModalVisible(false)
            }
        } catch (error) {
            setError("Error capturing image. Please try again.")
            console.error("Error capturing image:", error)
        }
    }, [])

    const handleRemoveImage = useCallback((index) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }, [])

    const handleSubmit = useCallback(async () => {
        if (images.length === 0) {
            Alert.alert("Error", "Please upload at least one prescription image.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const token = await SecureStore.getItemAsync("token")
            const parsedToken = JSON.parse(token)
            console.log(parsedToken)
            if (!parsedToken) {
                setRegistrationModalVisible(true)
                setLoading(false)
                return
            }

            const formData = new FormData()
            images.forEach((image, index) => {
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

            // console.log("Server response:", response.data)

            if (response.status === 200) {
                setSuccess(true)
                setUploadedPrescriptions(response.data.files)
                setSuccessModalVisible(true)
                setIdPrescriptions(response.data.uuid)
                setImages([])
            } else {
                throw new Error("Upload failed.")
            }
        } catch (err) {
            console.error("Upload error:", err)
            setError("Failed to upload prescriptions. Please try again.")
            Alert.alert("Error", "Failed to upload prescriptions. Please try again.")
        } finally {

            setLoading(false)
        }
    }, [images])

    useEffect(() => {
        setTimeout(() => {
            setSuccess(false)
        }, 3000)
    }, [])
    return (
        <View style={styles.container}>
            {error && (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={20} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {success && (
                <View style={styles.successContainer}>
                    <Icon name="check-circle" size={20} color="#059669" />
                    <Text style={styles.successText}>Prescriptions uploaded successfully!</Text>
                </View>
            )}

            {images.length > 0 && (
                <View style={styles.previewSection}>
                    <Text style={styles.previewTitle}>Selected Prescriptions ({images.length}/5)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewScroll}>
                        {images.map((image, index) => (
                            <ImagePreview key={index} uri={image.uri} onRemove={() => handleRemoveImage(index)} />
                        ))}
                    </ScrollView>
                </View>
            )}

            <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
                <View style={styles.buttonContent}>
                    <Icon name="upload" size={24} color="#010f16" style={styles.uploadIcon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.uploadText}>Upload prescription</Text>
                        <Text style={styles.subText}>Upload up to 5 prescription images</Text>
                    </View>
                    <Icon name="clipboard-text-outline" size={28} color="#054b6d" style={styles.prescriptionIcon} />
                </View>
            </TouchableOpacity>

            {images.length > 0 && (
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Prescriptions</Text>
                    )}
                </TouchableOpacity>
            )}

            <UploadModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onUpload={handleUpload}
                onCamera={handleCamera}
            />

            <RegistrationModal
                visible={registrationModalVisible}
                onClose={() => setRegistrationModalVisible(false)}
                onSuccess={() => {
                    setRegistrationModalVisible(false)
                    handleSubmit()
                }}
            />

            <SuccessModal
                visible={successModalVisible}
                onClose={() => {
                    setSuccessModalVisible(false)
                    navigation.navigate("Prescriptions")
                }}
                uuid={IdPrescriptions}
                prescriptions={uploadedPrescriptions}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#FFFFFF",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: "#DC2626",
        marginLeft: 8,
        flex: 1,
    },
    successContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    successText: {
        color: "#059669",
        marginLeft: 8,
        flex: 1,
    },
    previewSection: {
        marginBottom: 16,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1C1C1C",
        marginBottom: 12,
    },
    previewScroll: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    uploadButton: {
        backgroundColor: "#FFF2F4",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    uploadIcon: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    uploadText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1C1C1C",
        marginBottom: 4,
    },
    subText: {
        fontSize: 14,
        color: "#666666",
    },
    prescriptionIcon: {
        marginLeft: 12,
    },
    submitButton: {
        backgroundColor: "#FF4D67",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    submitButtonDisabled: {
        backgroundColor: "#FFA5B3",
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
})

export default PrescriptionUpload

