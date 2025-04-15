import { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { deleteFromSecureStore } from "../../store/slice/auth/login.slice"
import { API_V1_URL } from "../../constant/API"

const { width } = Dimensions.get("window")

const RegistrationModal = ({ visible, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        customer_name: "",
        password: "",
        email_id: "",
        mobile: "",
        platform: "App",
        otp: "",
    })
    const [touched, setTouched] = useState({})
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [statusMessage, setStatusMessage] = useState({ type: "", message: "" })
    const [animation] = useState(new Animated.Value(0))
    const [otpModalVisible, setOtpModalVisible] = useState(false)
    const [receivedOtp, setReceivedOtp] = useState("")
    const saveToSecureStore = async (key, value) => {
        await SecureStore.setItemAsync(key, JSON.stringify(value))
    }
    console.log("otp", receivedOtp)
    useEffect(() => {
        if (visible) {
            Animated.timing(animation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }
    }, [visible, animation]) // Added animation to dependencies

    const showMessage = (type, message) => {
        setStatusMessage({ type, message })
        setTimeout(() => setStatusMessage({ type: "", message: "" }), 3000)
    }

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (touched[name]) validateField(name, value)
    }

    const handleBlur = (name) => {
        setTouched((prev) => ({ ...prev, [name]: true }))
        validateField(name, formData[name])
    }

    const validateField = (name, value) => {
        let error = ""
        switch (name) {
            case "customer_name":
                error = !value.trim() ? "Name is required" : ""
                break
            case "email_id":
                error = !/\S+@\S+\.\S+/.test(value) ? "Invalid email address" : ""
                break
            case "password":
                error = value.length < 8 ? "Password must be at least 8 characters" : ""
                break
            case "mobile":
                error = !/^\d{10}$/.test(value) ? "Invalid mobile number" : ""
                break
            case "otp":
                error = !/^\d{6}$/.test(value) ? "OTP must be 6 digits" : ""
                break
        }
        setErrors((prev) => ({ ...prev, [name]: error }))
        return !error
    }

    const handleRegister = async () => {
        const fields = ["customer_name", "email_id", "password", "mobile"]
        const touchedAll = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
        setTouched(touchedAll)

        const isValid = fields.every((field) => validateField(field, formData[field]))
        if (!isValid) {
            showMessage("error", "Please fill all fields correctly")
            return
        }

        setLoading(true)
        try {
            const response = await axios.post(`${API_V1_URL}/api/v1/register-prescribe_user"`, formData)

            const { token, otp, login } = response.data
            await saveToSecureStore("token", token)
            await saveToSecureStore("otp", otp)
            await saveToSecureStore("login", login)
            setReceivedOtp(otp)
            setOtpModalVisible(true)
            onClose() // Close the main registration modal
            showMessage("success", "Registration successful. Please enter OTP.")
        } catch (error) {
            console.log(error)
            showMessage("error", "Registration failed. Try again later.")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async () => {

        if (Number(formData.otp) === receivedOtp) {
            await saveToSecureStore("otp", formData.otp)
            setOtpModalVisible(false)
            onClose() 
            onSuccess()
            showMessage("success", "OTP verified successfully!")
            await deleteFromSecureStore('isSkip');
        } else {
            setErrors((prev) => ({ ...prev, otp: "Invalid OTP. Please try again." }))
        }
    }

    const handleResendOtp = async () => {
        try {
            const storedUser = await SecureStore.getItemAsync("tempUser")
            const { userId } = JSON.parse(storedUser)

            await axios.post(`${API_V1_URL}/api/v1/resend-otp`, { userId })
            showMessage("success", "OTP resent successfully")
        } catch (error) {
            showMessage("error", "Failed to resend OTP")
        }
    }

    const renderInput = (name, placeholder, icon, keyboardType = "default", secureTextEntry = false) => (
        <View style={styles.inputContainer}>
            <Icon name={icon} size={20} color="#A0AEC0" style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#A0AEC0"
                value={formData[name]}
                onChangeText={(text) => handleChange(name, text)}
                onBlur={() => handleBlur(name)}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
            />
            {touched[name] && errors[name] && <Icon name="alert-circle" size={20} color="#FC8181" style={styles.errorIcon} />}
        </View>
    )

    return (
        <>
            <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                opacity: animation,
                                transform: [
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [300, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={["#667eea", "#764ba2"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientHeader}
                        >
                            <Text style={styles.modalTitle}>{showOtpInput ? "Verify OTP" : "Join Us"}</Text>
                        </LinearGradient>
                        <ScrollView contentContainerStyle={styles.scrollViewContent}>
                            {statusMessage.message && (
                                <Animated.View
                                    style={[
                                        styles.statusMessageContainer,
                                        { backgroundColor: statusMessage.type === "error" ? "#FED7D7" : "#C6F6D5" },
                                    ]}
                                >
                                    <Text
                                        style={[styles.statusMessage, { color: statusMessage.type === "error" ? "#9B2C2C" : "#276749" }]}
                                    >
                                        {statusMessage.message}
                                    </Text>
                                </Animated.View>
                            )}
                            {!showOtpInput ? (
                                <>
                                    {renderInput("customer_name", "Full Name", "account", "default")}
                                    {renderInput("email_id", "Email", "email", "email-address")}
                                    {renderInput("password", "Password", "lock", "default", true)}
                                    {renderInput("mobile", "Mobile Number", "phone", "phone-pad")}

                                    <TouchableOpacity
                                        style={[styles.button, loading && styles.buttonDisabled]}
                                        onPress={handleRegister}
                                        disabled={loading}
                                    >
                                        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Register</Text>}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {renderInput("otp", "Enter OTP", "numeric", "number-pad")}

                                    <TouchableOpacity
                                        style={[styles.button, loading && styles.buttonDisabled]}
                                        onPress={handleVerifyOtp}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.buttonText}>Verify OTP</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton}>
                                        <Text style={styles.resendButtonText}>Resend OTP</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>
            <Modal visible={otpModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.otpModalContainer}>
                    <LinearGradient
                        colors={["#667eea", "#764ba2"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.otpModalContent}
                    >
                        <TouchableOpacity style={styles.closeButton} onPress={() => setOtpModalVisible(false)}>
                            <Icon name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.otpModalTitle}>Verify OTP</Text>
                        <Text style={styles.otpModalSubtitle}>Please enter the 6-digit code sent to your mobile number.</Text>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="Enter OTP"
                            placeholderTextColor="#A0AEC0"
                            keyboardType="numeric"
                            maxLength={6}
                            value={formData.otp}
                            onChangeText={(text) => handleChange("otp", text)}
                            accessibilityLabel="OTP Input"
                            accessibilityHint="Enter the 6-digit OTP sent to your mobile"
                        />
                        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleVerifyOtp}
                            accessibilityLabel="Verify OTP"
                            accessibilityHint="Tap to verify the entered OTP"
                        >
                            <Text style={styles.buttonText}>Verify OTP</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton}>
                            <Text style={styles.resendButtonText}>Resend OTP</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </KeyboardAvoidingView>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 20,
        width: width * 0.9,
        maxHeight: "80%",
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradientHeader: {
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
    },
    scrollViewContent: {
        padding: 20,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: "#F7FAFC",
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        color: "#4A5568",
        fontSize: 16,
    },
    inputIcon: {
        marginRight: 10,
    },
    errorIcon: {
        marginLeft: 10,
    },
    button: {
        backgroundColor: "#667eea",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: "#A0AEC0",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    statusMessageContainer: {
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    statusMessage: {
        textAlign: "center",
        fontSize: 14,
    },
    resendButton: {
        marginTop: 15,
        alignItems: "center",
    },
    resendButtonText: {
        color: "#667eea",
        fontWeight: "bold",
        fontSize: 14,
    },
    otpModalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    otpModalContent: {
        width: width * 0.9,
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
        elevation: 5,
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
    },
    otpModalTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#FFFFFF",
        textAlign: "center",
    },
    otpModalSubtitle: {
        fontSize: 16,
        color: "#E2E8F0",
        textAlign: "center",
        marginBottom: 20,
    },
    otpInput: {
        width: "100%",
        padding: 15,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        fontSize: 24,
        marginBottom: 20,
        color: "#4A5568",
    },
    errorText: {
        color: "#FC8181",
        fontSize: 14,
        marginBottom: 10,
        textAlign: "center",
    },
    resendButton: {
        marginTop: 15,
    },
    resendButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
})

export default RegistrationModal

