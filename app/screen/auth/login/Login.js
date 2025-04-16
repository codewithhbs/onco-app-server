import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getFromSecureStore, loginUser, saveToSecureStore } from "../../../store/slice/auth/login.slice";

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

export default function ModernLoginPage() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { loading, error } = useSelector((state) => state.login) || {};

  const [number, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [fadeAnimation] = useState(new Animated.Value(0));
  const [slideAnimation] = useState(new Animated.Value(-100));
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const otpInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Handle animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnimation, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Handle resend timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Clear error messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSendOTP = async () => {
    // Validate phone number first
    if (!number || number.length < 10) {
      setMessage({ type: "error", text: "Please enter a valid mobile number" });
      return;
    }

    try {
      setMessage({ type: "", text: "" });
      const response = await dispatch(loginUser({ mobile: number }));

      // Handle response based on payload
      if (response?.payload?.login) {
        // Animation for successful OTP send
        Animated.sequence([
          Animated.timing(fadeAnimation, {
            toValue: 0.6,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();

        setOtpSent(true);
        setMessage({ type: "success", text: "OTP sent successfully" });
        setOtp("");

        // Focus on OTP input after a short delay
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 300);
      } else if (response?.payload?.message === "User not found.") {
        // Navigate to register page with the phone number
        navigation.navigate("register", { mobile_number: number });
      } else {
        setMessage({ type: "error", text: response?.payload?.message || "Failed to send OTP" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({ type: "error", text: error.message || "An error occurred" });
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setMessage({ type: "error", text: "Please enter a valid OTP" });
      return;
    }

    try {
      // Get stored OTP from secure storage
      const storedOtp = await getFromSecureStore("otp");

      if (otp === storedOtp) {
        await saveToSecureStore("isVerify", 'true');

        setMessage({ type: "success", text: "OTP verified successfully!" });

        // Important: For iOS, we need to make sure the navigation happens after state updates
        setTimeout(() => {
          setOtpSent(false); // Reset the state
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }, 300);
      } else {
        setMessage({ type: "error", text: "Invalid OTP. Please try again." });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage({ type: "error", text: "Verification failed. Please try again." });
    }
  };

  const handleResendOTP = () => {
    if (resendAttempts >= 3) {
      setMessage({ type: "error", text: "Maximum resend attempts reached" });
      return;
    }

    if (resendTimer > 0) {
      setMessage({ type: "error", text: `Please wait ${resendTimer}s before resending` });
      return;
    }

    setResendAttempts((prev) => prev + 1);
    setResendTimer(30); // 30 seconds cooldown period
    handleSendOTP();
  };

  const handleSkip = async () => {
    try {
      await SecureStore.setItemAsync("isSkip", "true");

      // Use navigation.reset to avoid back navigation issues
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error("Skip error:", error);
    }
  };

  // Message notification component
  const MessageNotification = () => {
    if (!message.text) return null;

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          message.type === "error" ? styles.errorContainer : styles.successContainer,
          { opacity: fadeAnimation }
        ]}
      >
        <Ionicons
          name={message.type === "error" ? "alert-circle" : "checkmark-circle"}
          size={20}
          color={message.type === "error" ? "#E53E3E" : "#38A169"}
          style={styles.messageIcon}
        />
        <Text style={[
          styles.messageText,
          message.type === "error" ? styles.errorText : styles.successText
        ]}>
          {message.text}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={isIOS ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient
              colors={["#eef4ff", "#ffffff", "#f0f7ff"]}
              style={styles.container}
            >
              <Animated.View
                style={[
                  styles.content,
                  { opacity: fadeAnimation, transform: [{ translateY: slideAnimation }] }
                ]}
              >
                {/* Top Medical Decoration */}
                <View style={styles.decorationTop}>
                  <FontAwesome5 name="pills" size={28} color="#4285F4" style={styles.decorationIcon} />
                  <FontAwesome5 name="heartbeat" size={28} color="#5C6BC0" style={styles.decorationIcon} />
                  <FontAwesome5 name="first-aid" size={28} color="#7986CB" style={styles.decorationIcon} />
                </View>

                {/* Logo and Title */}
                <View style={styles.logoContainer}>
                  <Image
                    source={{ uri: "https://i.ibb.co/KrtDn0p/logo-onco.png" }}
                    style={styles.logo}
                  />
                  {/* <Text77619794 style={styles.title}>Onco Health Mart</Text> */}
                  <Text style={styles.subtitle}>Your trusted medicine partner</Text>
                </View>

                {/* Message Notification */}
                <MessageNotification />

                {/* Input Fields */}
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="call-outline" size={20} color="#4285F4" />
                    </View>
                    <TextInput
                      ref={phoneInputRef}
                      style={styles.input}
                      placeholder="Mobile Number"
                      placeholderTextColor="#777"
                      value={number}
                      onChangeText={setNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                      editable={!otpSent}
                    />
                    {number.length > 0 && !otpSent && (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setNumber("")}
                      >
                        <Ionicons name="close-circle" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {otpSent && (
                    <Animated.View
                      style={[
                        styles.inputContainer,
                        { opacity: fadeAnimation }
                      ]}
                    >
                      <View style={styles.inputIconContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#4285F4" />
                      </View>
                      <TextInput
                        ref={otpInputRef}
                        style={styles.input}
                        placeholder="Enter OTP"
                        placeholderTextColor="#777"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      {otp.length > 0 && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={() => setOtp("")}
                        >
                          <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                      )}
                    </Animated.View>
                  )}

                  {/* Action Buttons */}
                  <TouchableOpacity
                    onPress={otpSent ? handleVerifyOTP : handleSendOTP}
                    style={styles.button}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>
                          {otpSent ? "Verify OTP" : "Send OTP"}
                        </Text>
                        <Ionicons
                          name={otpSent ? "checkmark-circle" : "arrow-forward-circle"}
                          size={20}
                          color="#fff"
                          style={{ marginLeft: 8 }}
                        />
                      </>
                    )}
                  </TouchableOpacity>

                  {otpSent && (
                    <TouchableOpacity
                      onPress={handleResendOTP}
                      style={styles.resendButton}
                      disabled={resendTimer > 0}
                    >
                      <Ionicons name="refresh" size={16} color={resendTimer > 0 ? "#aaa" : "#4285F4"} />
                      <Text style={[
                        styles.resendText,
                        resendTimer > 0 && { color: "#aaa" }
                      ]}>
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip and continue as Guest</Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom Decoration & Trust Elements */}
                <View style={styles.trustContainer}>
                  <View style={styles.securityInfo}>
                    <Ionicons name="shield-checkmark" size={16} color="#4285F4" />
                    <Text style={styles.securityText}>Secure Authentication</Text>
                  </View>
                </View>
              </Animated.View>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  decorationTop: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    top: height * 0.05,
    width: "100%",
  },
  decorationIcon: {
    marginHorizontal: 15,
    opacity: 0.7,
  },
  logoContainer: {

    width: '100%',
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.12,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 15,
    width: "100%",
    height: 55,
    borderWidth: 1,
    borderColor: "#e1e1e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: isIOS ? 0 : 2,
  },
  inputIconContainer: {
    width: 50,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
    fontSize: 16,
    paddingHorizontal: 15,
  },
  clearButton: {
    padding: 10,
  },
  button: {
    width: "100%",
    height: 55,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 10,
    flexDirection: "row",
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: isIOS ? 0 : 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  resendButton: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    color: "#4285F4",
    fontSize: 15,
    marginLeft: 5,
  },
  skipButton: {
    marginTop: 20,
    padding: 5,
  },
  skipText: {
    color: "#666",
    fontSize: 15,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    borderLeftWidth: 4,
  },
  errorContainer: {
    backgroundColor: "#FFF5F5",
    borderLeftColor: "#E53E3E",
  },
  successContainer: {
    backgroundColor: "#F0FFF4",
    borderLeftColor: "#38A169",
  },
  messageIcon: {
    marginRight: 8,
  },
  messageText: {
    fontSize: 14,
    flex: 1,
  },
  errorText: {
    color: "#C53030",
  },
  successText: {
    color: "#2F855A",
  },
  trustContainer: {
    position: "absolute",
    bottom: height * 0.05,
    width: "100%",
    alignItems: "center",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  securityText: {
    marginLeft: 5,
    color: "#555",
    fontSize: 14,
  },
});