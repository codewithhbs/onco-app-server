import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { validatePassword, validateMobile, validateEmail } from './validation';
import CustomInput from './CustomInput';
import { styles } from './RegisterStyles';
import { colors } from './colors';
import { useRoute } from '@react-navigation/native';
import { API_V1_URL } from '../../../constant/API';


const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    password: '',
    email_id: '',
    mobile: '',
    platform: 'App',
    otp: '',
  });
  const route = useRoute()
  const { mobile_number } = route.params || {}
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });


  useEffect(() => {
    if (mobile_number) {
      setFormData((prev) => ({
        ...prev,
        mobile: mobile_number,
      }))
    }
  }, [route])
  const showMessage = (type, message) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
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
          ? 'Password must contain 8+ characters with uppercase, lowercase, number and special character'
          : '';
        break;
      case 'mobile':
        error = !validateMobile(value) ? 'Invalid mobile number' : '';
        break;
      case 'otp':
        error = !value.trim() || value.length !== 6 ? 'Please enter valid 6-digit OTP' : '';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleRegister = async () => {
    const fields = ['customer_name', 'email_id', 'password', 'mobile'];
    const touchedAll = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(touchedAll);

    const isValid = fields.every(field => validateField(field, formData[field]));
    if (!isValid) {
      showMessage('error', 'Please fill all fields correctly');
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
    } catch (error) {
      console.log(error.response.data.errors)
      showMessage('error', error.response?.data?.message || error.response?.data?.errors || 'Registration failed');
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
      const { userId } = JSON.parse(storedUser);

      await axios.post(`${API_V1_URL}/api/v1/otp-user-verify`, {
        otp: formData.otp,
        userId,
      });

      showMessage('success', 'Account verified successfully!');
      setTimeout(() => navigation.navigate('login'), 1500);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('tempUser');
      const { userId } = JSON.parse(storedUser);

      await axios.post(`${API_V1_URL}/api/v1/resend-otp`, { userId });
      showMessage('success', 'OTP resent successfully');
    } catch (error) {
      showMessage('error', 'Failed to resend OTP');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://i.ibb.co/KrtDn0p/logo-onco.png' }}
            style={styles.logo}
          />
        </View>

        {statusMessage.message && (
          <View style={styles[statusMessage.type === 'success' ? 'successMessage' : 'errorMessage']}>
            <Text style={styles[statusMessage.type === 'success' ? 'successText' : 'errorMessageText']}>
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
            />

            <CustomInput
              label="Password"
              icon="lock"
              placeholder="Enter Your password"
              secureTextEntry
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              touched={touched.password}
            />

            <CustomInput
              label="Mobile"
              icon="phone"
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              value={formData.mobile}
              onChangeText={(value) => handleChange('mobile', value)}
              onBlur={() => handleBlur('mobile')}
              error={errors.mobile}
              touched={touched.mobile}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
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
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOtp}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Register;