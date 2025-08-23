import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  Dimensions,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { validatePassword, validateMobile, validateEmail } from './validation';
import CustomInput from './CustomInput';
import { useRoute } from '@react-navigation/native';
import { API_V1_URL } from '../../../constant/API';

// Enhanced color scheme
const colors = {
  primary: '#4A6FFF',
  primaryDark: '#3D5CCC',
  secondary: '#FF6B6B',
  background: '#F9FAFC',
  surface: '#FFFFFF',
  text: '#333333',
  textLight: '#777777',
  border: '#E1E5EA',
  success: '#4CAF50',
  error: '#F44336',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Dynamic styles based on screen dimensions
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: height * 0.03,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.15,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  subHeaderText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: height * 0.03,
  },
  formContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: width * 0.05,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: height * 0.02,
  },
  otpContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: width * 0.05,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: height * 0.02,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: height * 0.018,
    paddingHorizontal:16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.02,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: height * 0.02,
    padding: 10,
  },
  resendText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  successMessage: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    padding: 12,
    marginBottom: height * 0.02,
    borderRadius: 4,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
  },
  errorMessage: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    padding: 12,
    marginBottom: height * 0.02,
    borderRadius: 4,
  },
  errorMessageText: {
    color: colors.error,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.025,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textLight,
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: height * 0.015,
  },
  socialButton: {
    width: '45%',
    paddingVertical: height * 0.015,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  socialButtonText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  footerText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.02,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },
  progressStep: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: colors.primary,
    width: 20,
  },
};

const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    password: '123456',
    email_id: '',
    mobile: '',
    platform: Platform.OS === 'ios' ? 'iOS' : 'Android',
    otp: '',
  });
  
  const route = useRoute();
  const { mobile_number } = route.params || {};
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef(null);

  // Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Set mobile number if passed from previous screen
  useEffect(() => {
    if (mobile_number) {
      setFormData((prev) => ({
        ...prev,
        mobile: mobile_number,
      }));
    }
  }, [route]);

  const showMessage = (type, message) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage({ type: '', message: '' }), 4000);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'customer_name':
        error = !value.trim() ? 'Name is required' : '';
        break;
      case 'email_id':
        error = !validateEmail(value) ? 'Invalid email address' : '';
        break;
      case 'password':
        error = !validatePassword(value)
          ? 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
          : '';
        break;
      case 'mobile':
        error = !validateMobile(value) ? 'Please enter a valid 10-digit mobile number' : '';
        break;
      case 'otp':
        error = !value.trim() || value.length !== 6 ? 'Please enter valid 6-digit OTP' : '';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };
// hbsdevelopersteam@gmail.comhbshbs
  const handleRegister = async () => {
    // const fields = ['customer_name', 'email_id', 'password', 'mobile'];
    const fields = ['customer_name', 'email_id', 'mobile'];
    const touchedAll = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(touchedAll);
    // console.log('formData',formData);
    const isValid = fields.every(field => validateField(field, formData[field]));
    if (!isValid) {
      showMessage('error', 'Please fill all fields correctly');
      // Find first error and scroll to it
      for (const field of fields) {
        if (errors[field]) {
          Keyboard.dismiss();
          return;
        }
      }
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_V1_URL}/api/v1/register-user`, formData);
      const { message, userId } = response.data || {};

      if (!userId) throw new Error('User ID not found in response');

      await SecureStore.setItemAsync('tempUser', JSON.stringify({ userId }));
      showMessage('success', message || 'Registration successful! Please verify your OTP');
      setShowOtpModal(true);
      setCurrentStep(2);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      (error.response?.data?.errors ? Object.values(error.response.data.errors).join(', ') : 'Registration failed');
      showMessage('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateField('otp', formData.otp)) {
      showMessage('error', 'Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      const storedUser = await SecureStore.getItemAsync('tempUser');
      if (!storedUser) {
        throw new Error('User session expired');
      }
      
      const { userId } = JSON.parse(storedUser);

      await axios.post(`${API_V1_URL}/api/v1/otp-user-verify`, {
        otp: formData.otp,
        userId,
      });

      showMessage('success', 'Account verified successfully!');
      setCurrentStep(3);
      
      // Navigate after showing success message
      setTimeout(() => navigation.navigate('login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'OTP verification failed';
      showMessage('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('tempUser');
      if (!storedUser) {
        showMessage('error', 'Session expired. Please register again.');
        setShowOtpModal(false);
        return;
      }
      
      const { userId } = JSON.parse(storedUser);

      setLoading(true);
      await axios.post(`${API_V1_URL}/api/v1/resend-otp`, { userId });
      showMessage('success', 'OTP resent successfully');
    } catch (error) {
      showMessage('error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.navigate('login');
  };

  const renderProgressSteps = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressStep, currentStep >= 1 && styles.activeStep]} />
      <View style={[styles.progressStep, currentStep >= 2 && styles.activeStep]} />
      <View style={[styles.progressStep, currentStep >= 3 && styles.activeStep]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'https://i.ibb.co/KrtDn0p/logo-onco.png' }}
                style={styles.logo}
              />
            </View>

            {renderProgressSteps()}

            {!keyboardVisible && (
              <View>
                <Text style={styles.headerText}>
                  {showOtpModal ? 'Verify Your Account' : 'Create Account'}
                </Text>
                <Text style={styles.subHeaderText}>
                  {showOtpModal
                    ? 'Enter the OTP sent to your mobile number'
                    : 'Please fill in the details to get started'}
                </Text>
              </View>
            )}

            {statusMessage.message && (
              <View
                style={
                  statusMessage.type === 'success'
                    ? styles.successMessage
                    : styles.errorMessage
                }
              >
                <Text
                  style={
                    statusMessage.type === 'success'
                      ? styles.successText
                      : styles.errorMessageText
                  }
                >
                  {statusMessage.message}
                </Text>
              </View>
            )}

            {!showOtpModal ? (
              <View style={styles.formContainer}>
                <CustomInput
                  label="Full Name"
                  icon="person"
                  placeholder="Enter your full name"
                  value={formData.customer_name}
                  onChangeText={(value) => handleChange('customer_name', value)}
                  onBlur={() => handleBlur('customer_name')}
                  error={errors.customer_name}
                  touched={touched.customer_name}
                  returnKeyType="next"
                />

                <CustomInput
                  label="Email"
                  icon="mail"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  value={formData.email_id}
                  onChangeText={(value) => handleChange('email_id', value)}
                  onBlur={() => handleBlur('email_id')}
                  error={errors.email_id}
                  touched={touched.email_id}
                  autoCapitalize="none"
                  returnKeyType="next"
                />

                {/* <CustomInput
                  label="Password"
                  icon="finger-print"
                  placeholder="Enter your password"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  onBlur={() => handleBlur('password')}
                  error={errors.password}
                  touched={touched.password}
                  returnKeyType="next"
                /> */}

                <CustomInput
                  label="Mobile"
                  icon="call"
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  value={formData.mobile}
                  onChangeText={(value) => handleChange('mobile', value)}
                  onBlur={() => handleBlur('mobile')}
                  error={errors.mobile}
                  touched={touched.mobile}
                  returnKeyType="done"
                  maxLength={10}
                />

                <TouchableOpacity
                  style={[styles.button, loading && { opacity: 0.7 }]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.footerText}>
                  <Text style={{ color: colors.textLight }}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity onPress={goToLogin}>
                    <Text style={styles.linkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.otpContainer}>
                <Text style={styles.title}>Verify OTP</Text>
                <View style={{ width: '100%' }}>
                  <CustomInput
                    label="Enter OTP"
                    icon="key"
                    placeholder="Enter 6-digit OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={formData.otp}
                    onChangeText={(value) => handleChange('otp', value)}
                    onBlur={() => handleBlur('otp')}
                    error={errors.otp}
                    touched={touched.otp}
                    returnKeyType="done"
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && { opacity: 0.7 }]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOtp}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>
                    Didn't receive OTP? Resend
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;