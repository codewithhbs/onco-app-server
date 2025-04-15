import { useState, useEffect, useRef } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Animated } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as SecureStore from 'expo-secure-store'
import { useDispatch, useSelector } from "react-redux"
import { useNavigation, useRoute } from "@react-navigation/native"
import { getFromSecureStore, loginUser } from "../../../store/slice/auth/login.slice"

export default function ModernLoginPage() {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const route = useRoute()
  const { isLogin, loading, error } = useSelector((state) => state.login) || {}

  const [number, setNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [resendAttempts, setResendAttempts] = useState(0)
  const [resendTimer, setResendTimer] = useState(0)
  const [animation] = useState(new Animated.Value(0))

  const otpInputRef = useRef(null)

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [animation])

  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleSendOTP = async () => {
    if (!number) {
      setMessage({ type: "error", text: "Please enter your mobile number." })
      return
    }

    try {
      const response = await dispatch(loginUser({ mobile: number }))
      if (response?.payload?.login) {
        setOtpSent(true)
        setMessage({ type: "success", text: "OTP sent successfully. Please verify." })
        setOtp("")

        setTimeout(() => {
          otpInputRef.current?.focus()
        }, 100)
      } else if (response?.payload?.message === "User not found.") {
        navigation.navigate("register", { mobile_number: number })
      } else {
        setMessage({ type: "error", text: "Something went wrong. Please try again." })
      }
    } catch (error) {
      console.error("Login error:", error)
      setMessage({ type: "error", text: error.message || "An error occurred during login." })
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp) {
      setMessage({ type: "error", text: "Please enter the OTP." })
      return
    }
    const getOtp = await getFromSecureStore("otp")

    if (otp !== getOtp) {
      setMessage({ type: "error", text: "Invalid OTP. Please try again." })
      return
    }
    // Implement OTP verification logic here
    setMessage({ type: "success", text: "OTP verified successfully!" })
    setOtpSent(false)
    navigation.navigate("Home")
  }

  const handleResendOTP = () => {
    if (resendAttempts >= 5) {
      setMessage({ type: "error", text: "Maximum resend attempts reached." })
      return
    }
    if (resendTimer > 0) {
      setMessage({ type: "error", text: `Please wait ${resendTimer} seconds before resending.` })
      return
    }
    setResendAttempts((prev) => prev + 1)
    setResendTimer(2)
    handleSendOTP()
  }

  const handleSkip = async () => {
    await SecureStore.setItemAsync("isSkip","true")
    navigation.navigate("Home")
  }

  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#9dd5f0", "#ffffff", "#ceeaf8"]} style={styles.container}>
        <Animated.View style={[styles.content, { opacity: animation }]}>
          <Image source={{ uri: "https://i.ibb.co/KrtDn0p/logo-onco.png" }} style={styles.logo} />

          {message.text && (
            <View
              style={[
                styles.messageContainer,
                message.type === "error" ? styles.errorContainer : styles.successContainer,
              ]}
            >
              <Text style={[styles.messageText, message.type === "error" ? styles.errorText : styles.successText]}>
                {message.text}
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={24} color="#000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#000"
              value={number}
              onChangeText={setNumber}
              keyboardType="phone-pad"
            />
          </View>

          {otpSent && (
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#000" style={styles.inputIcon} />
              <TextInput
                ref={otpInputRef}
                style={styles.input}
                placeholder="OTP"
                placeholderTextColor="#000"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={otpSent ? handleVerifyOTP : handleSendOTP}
            style={styles.button}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{otpSent ? "Verify OTP" : "Send OTP"}</Text>
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity onPress={handleResendOTP} style={styles.resendButton} disabled={resendTimer > 0}>
              <Text style={styles.resendText}>{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip and continue as Guest</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(133, 202, 237, 0.5)",
    borderRadius: 40,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: "100%",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#000",
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#3b5998",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendButton: {
    marginTop: 15,
  },
  resendText: {
    color: "#3b5998",
    fontSize: 16,
  },
  skipButton: {
    marginTop: 20,
  },
  skipText: {
    color: "#333",
    fontSize: 16,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: "100%",
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
  },
  successContainer: {
    backgroundColor: "#F0FFF4",
  },
  messageText: {
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    color: "#E53E3E",
  },
  successText: {
    color: "#38A169",
  },
})

