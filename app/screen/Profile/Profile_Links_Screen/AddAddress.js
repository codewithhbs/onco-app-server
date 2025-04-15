import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_V1_URL } from '../../../constant/API';

export default function AddAddress({ visible, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        city: '',
        state: '',
        pincode: '',
        house_no: '',
        stree_address: '',
        type: 'home', 
    });

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleTypeChange = (type) => {
        setFormData({
            ...formData,
            type: type,
        });
    };

    const handleSubmit = async () => {
        try {
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

            onSuccess()
            Alert.alert('Success', 'Address added successfully');


        } catch (error) {
            console.error('Error adding address:', error);
            Alert.alert('Error', 'Failed to add address');
        }
    };

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.header}>Add New Address</Text>

                <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(text) => handleChange('city', text)}
                />
               
                <TextInput
                    style={styles.input}
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChangeText={(text) => handleChange('pincode', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="House No."
                    value={formData.house_no}
                    onChangeText={(text) => handleChange('house_no', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Street Address"
                    value={formData.stree_address}
                    onChangeText={(text) => handleChange('stree_address', text)}
                />

                <View style={styles.typeContainer}>
                    <TouchableOpacity onPress={() => handleTypeChange('home')} style={styles.typeButton}>
                        <Icon name="home-outline" size={24} color={formData.type === 'home' ? '#0A95DA' : '#9CA3AF'} />
                        <Text style={formData.type === 'home' ? styles.activeText : styles.inactiveText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTypeChange('office')} style={styles.typeButton}>
                        <Icon name="office-building-outline" size={24} color={formData.type === 'office' ? '#0A95DA' : '#9CA3AF'} />
                        <Text style={formData.type === 'office' ? styles.activeText : styles.inactiveText}>Office</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTypeChange('Other')} style={styles.typeButton}>
                        <Icon name="map-marker-outline" size={24} color={formData.type === 'Other' ? '#0A95DA' : '#9CA3AF'} />
                        <Text style={formData.type === 'Other' ? styles.activeText : styles.inactiveText}>Other</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Add Address</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        width: '80%',
        maxWidth: 400,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1f2937',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        fontSize: 16,
    },
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    typeButton: {
        alignItems: 'center',
    },
    activeText: {
        color: '#0A95DA',
        fontWeight: '600',
    },
    inactiveText: {
        color: '#9CA3AF',
        fontWeight: '400',
    },
    submitButton: {
        backgroundColor: '#0A95DA',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
    closeButton: {
        backgroundColor: '#E5E7EB',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    closeButtonText: {
        color: '#1f2937',
        textAlign: 'center',
        fontWeight: '500',
    },
});
