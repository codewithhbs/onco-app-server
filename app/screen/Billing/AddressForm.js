import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { LocationContext } from '../../utils/Location';
import { API_V1_URL } from '../../constant/API';

const AddressForm = ({ onClose, onSubmit, refresh }) => {
  const { location } = useContext(LocationContext)
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    pincode: '',
    house_no: '',
    stree_address: '',
    type: 'home',
  });

  // Add a ref to track if location data has been set
  const locationDataSet = useRef(false);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.house_no.trim()) {
      newErrors.house_no = 'House/Flat number is required';
    }

    if (!formData.stree_address.trim()) {
      newErrors.stree_address = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fixed useEffect - only run once when location data is available
  useEffect(() => {
    if (location?.weather && !locationDataSet.current) {
      setFormData(prevData => ({
        ...prevData,
        city: location?.weather?.district || prevData.city,
        state: location?.weather?.city || prevData.state,
        pincode: location?.weather?.postalCode || prevData.pincode,
        stree_address: location?.weather?.completeAddress || prevData.stree_address
      }));
      locationDataSet.current = true;
    }
  }, [location?.weather]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const tokenData = await SecureStore.getItemAsync('token');
      const token = JSON.parse(tokenData);
      const response = await axios.post(
        `${API_V1_URL}/api/v1/add-new-address`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      refresh();
      onSubmit(response.data.data);
      onClose()
      if (response.data.message) {
        Alert.alert('Success', 'Address added successfully');

      } else {
        Alert.alert('Error', response.data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert('Error', 'Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = useCallback((label, field, placeholder, keyboardType = 'default',multiline=false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} <Text style={styles.requiredStar}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={formData[field]}
        multiline={multiline}
        onChangeText={(text) => {
          console.log(`Updating ${field} to ${text}`);
          setFormData((prev) => ({ ...prev, [field]: text }));
          if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
          }
        }}

        placeholder={placeholder}
        keyboardType={keyboardType}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  ), [formData, errors]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {renderInput('House/Flat Number', 'house_no', 'Enter house/flat number')}
            {renderInput('Street Address', 'stree_address', 'Enter street address','default',true)}
            {renderInput('City', 'city', 'Enter city')}
            {renderInput('State', 'state', 'Enter state')}
            {renderInput('Pincode', 'pincode', 'Enter 6-digit pincode', 'numeric')}

            <View style={styles.addressTypeContainer}>
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.addressTypeButtons}>
                {['home', 'work', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.type === type && styles.activeTypeButton
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
                  >
                    <Icon
                      name={
                        type === 'home' ? 'home' :
                          type === 'work' ? 'briefcase' : 'map-marker'
                      }
                      size={20}
                      color={formData.type === type ? '#fff' : '#0A95DA'}
                    />
                    <Text style={[
                      styles.typeButtonText,
                      formData.type === type && styles.activeTypeButtonText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="check" size={24} color="#fff" />
                  <Text style={styles.submitButtonText}>Save Address</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  addressTypeContainer: {
    marginBottom: 20,
  },
  addressTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0A95DA',
    backgroundColor: '#fff',
  },
  activeTypeButton: {
    backgroundColor: '#0A95DA',
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#0A95DA',
  },
  activeTypeButtonText: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A95DA',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddressForm;