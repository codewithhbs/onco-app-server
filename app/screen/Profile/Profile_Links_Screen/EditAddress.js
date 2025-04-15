import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_V1_URL } from '../../../constant/API';

export default function EditAddress({ visible, address, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    pincode: '',
    house_no: '',
    stree_address: '',
    type: 'home', // Default selected type
  });

  useEffect(() => {
    if (address) {
      setFormData({
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        house_no: address.house_no,
        stree_address: address.stree_address,
        type: address.type,
      });
    }
  }, [address]);

  const handleChange = (field, value) => {
    setFormData(prevState => ({ ...prevState, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const tokenData = await SecureStore.getItemAsync('token');
      const token = JSON.parse(tokenData);

      const response = await axios.post(
        `${API_V1_URL}/api/v1/update-my-address/${address?.ad_id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error updating address:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose} 
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Edit Address</Text>

          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.city}
            onChangeText={text => handleChange('city', text)}
          />
        
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            value={formData.pincode}
            onChangeText={text => handleChange('pincode', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="House No"
            value={formData.house_no}
            onChangeText={text => handleChange('house_no', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={formData.stree_address}
            onChangeText={text => handleChange('stree_address', text)}
          />

          <View style={styles.typeContainer}>
            <TouchableOpacity 
              onPress={() => handleChange('type', 'home')} 
              style={[styles.typeButton, formData.type === 'home' && styles.selectedType]}>
              <Text style={styles.typeButtonText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleChange('type', 'office')} 
              style={[styles.typeButton, formData.type === 'office' && styles.selectedType]}>
              <Text style={styles.typeButtonText}>Office</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleChange('type', 'other')} 
              style={[styles.typeButton, formData.type === 'other' && styles.selectedType]}>
              <Text style={styles.typeButtonText}>Other</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
            <Icon name="check" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Icon name="close" size={24} color="#fff" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5, // Shadow effect for Android
    borderColor: '#ddd',
    borderWidth: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0088CC',
    borderRadius: 8,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedType: {
    backgroundColor: '#0A95DA ', // Highlight selected type with yellow background
    borderColor: '#0A95DA ', // Border color change
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0088CC',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
});
