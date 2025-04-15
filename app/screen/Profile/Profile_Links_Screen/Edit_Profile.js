import { useState, useEffect } from "react"
import { View, Text, StatusBar, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useSelector } from "react-redux"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { API_V1_URL } from "../../../constant/API"

export default function Edit_Profile() {
    const { user } = useSelector((state) => state.userData)
    const [formData, setFormData] = useState({
        name: "",
        number: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState({})
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otpPurpose, setOtpPurpose] = useState("")
    const [otp, setOtp] = useState("")
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    
    useEffect(() => {
        setFormData({
            name: user.customer_name,
            number: user?.mobile,
            email: user.email_id,
            password: "",
            confirmPassword: "",
        })
    }, [user])

    const handleChange = (name, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }))
        if (errors[name]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: null,
            }))
        }
    }

    const validate = () => {
        const newErrors = {}

        if (!formData.name.trim()) newErrors.name = "Name is required"
        if (!formData.number.trim()) {
            newErrors.number = "Number is required"
        } else if (!/^\d{10}$/.test(formData.number)) {
            newErrors.number = "Invalid phone number"
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email address"
        }
        if (showPasswordChange) {
            if (!formData.password) {
                newErrors.password = "Password is required"
            } else if (formData.password.length < 6) {
                newErrors.password = "Password must be at least 6 characters"
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        const tokenData = await SecureStore.getItemAsync("token")
        const token = tokenData ? JSON.parse(tokenData) : null
        if (!token) {
            Alert.alert("Error", "Authentication failed! Please login again.")
            return
        }
        if (validate()) {
            if (showPasswordChange && formData.password) {
                setOtpPurpose("password")
                setShowOtpModal(true)
            }
            try {
                const response = await axios.post(
                    `${API_V1_URL}/api/v1/user-update`,
                    {
                        customer_name: formData.name,
                        mobile: formData.number,
                        email_id: formData.email,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    },
                )
                if (formData.number !== user?.mobile && response.data.otpSent === "OTP sent to new mobile number") {
                    setOtpPurpose("number")
                    setShowOtpModal(true)
                }
                Alert.alert("Profile is updated Successfully !!")

            } catch (error) {
                console.log(error.response.data.message)
                Alert.alert("Error", error.response.data.message || "An error occurred while updating profile")
            }
        }
    }

    const handleOtpSubmit = () => {
        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            Alert.alert("Invalid OTP", "Please enter a 6-digit number")
            return
        }
        console.log("OTP submitted:", otp)
        setShowOtpModal(false)
        setOtp("")
        Alert.alert("Success", `${otpPurpose === "number" ? "Number" : "Password"} updated successfully!`)
    }

    const handleCloseOtpModal = () => {
        Alert.alert(
            "Close Verification",
            otpPurpose === "number"
                ? "If you close this, your mobile number will not be changed. Are you sure you want to close?"
                : "If you close this, your password will not be changed. Are you sure you want to close?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Yes, Close",
                    onPress: () => {
                        setShowOtpModal(false)
                        setOtp("")
                    },
                },
            ],
        )
    }

    const renderInput = (name, placeholder, secureTextEntry = false, keyboardType = "default") => (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={formData[name]}
                onChangeText={(text) => handleChange(name, text)}
                secureTextEntry={secureTextEntry && !showPassword}
                keyboardType={keyboardType}
            />
            {(name === "password" || name === "confirmPassword") && (
                <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="#0A95DA" />
                </TouchableOpacity>
            )}
            {errors[name] && <Text style={styles.errorText}>{errors[name]}</Text>}
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A95DA" />
            <View style={styles.header}>
                <Text style={styles.title}>Edit Profile</Text>
                <Text style={styles.subtitle}>Update Your Profile Information</Text>
            </View>
            <ScrollView style={styles.formContainer}>
                {renderInput("name", "Full Name")}
                {renderInput("number", "Phone Number", false, "phone-pad")}
                {renderInput("email", "Email Address", false, "email-address")}

                <View style={styles.passwordChangeContainer}>
                    <Text style={styles.passwordChangeText}>Change Password?</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={showPasswordChange ? "#0A95DA" : "#f4f3f4"}
                        onValueChange={() => setShowPasswordChange(!showPasswordChange)}
                        value={showPasswordChange}
                    />
                </View>

                {showPasswordChange && (
                    <>
                        {renderInput("password", "New Password", true)}
                        <Text style={styles.passwordNote}>
                            Password should be at least 6 characters long and include uppercase, lowercase, numbers, and special
                            characters.
                        </Text>
                        {renderInput("confirmPassword", "Confirm New Password", true)}
                    </>
                )}

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Update Profile</Text>
                </TouchableOpacity>
            </ScrollView>

            {showOtpModal && (
                <View style={styles.otpModalContainer}>
                    <View style={styles.otpModal}>
                        <TouchableOpacity style={styles.closeButton} onPress={handleCloseOtpModal}>
                            <Icon name="close" size={24} color="#0A95DA" />
                        </TouchableOpacity>
                        <Text style={styles.otpTitle}>Verify {otpPurpose === "number" ? "New Number" : "Password Change"}</Text>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="Enter OTP"
                            value={otp}
                            onChangeText={(text) => {
                                if (text.length <= 6 && /^\d*$/.test(text)) {
                                    setOtp(text)
                                }
                            }}
                            keyboardType="numeric"
                            maxLength={6}
                        />
                        <TouchableOpacity
                            style={[styles.otpSubmitButton, otp.length !== 6 && styles.otpSubmitButtonDisabled]}
                            onPress={handleOtpSubmit}
                            disabled={otp.length !== 6}
                        >
                            <Text style={styles.otpSubmitButtonText}>Verify OTP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        backgroundColor: "#0A95DA",
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    subtitle: {
        fontSize: 14,
        color: "#E1F5FE",
        marginTop: 4,
    },
    formContainer: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
        position: "relative",
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    passwordToggle: {
        position: "absolute",
        right: 15,
        top: 15,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 12,
        marginTop: 5,
    },
    passwordChangeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    passwordChangeText: {
        fontSize: 16,
        color: "#374151",
    },
    passwordNote: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: -15,
        marginBottom: 15,
    },
    submitButton: {
        backgroundColor: "#0A95DA",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginTop: 10,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    otpModalContainer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    otpModal: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        width: "80%",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
    },
    otpTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#0A95DA",
    },
    otpInput: {
        backgroundColor: "#F3F4F6",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        width: "100%",
        marginBottom: 20,
    },
    otpSubmitButton: {
        backgroundColor: "#0A95DA",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        width: "100%",
    },
    otpSubmitButtonDisabled: {
        backgroundColor: "#A0AEC0",
    },
    otpSubmitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
})

