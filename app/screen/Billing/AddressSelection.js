import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import AddressForm from './AddressForm';
import styles from './styles';
import { API_V1_URL } from '../../constant/API';

const AddressSelection = ({ onSelect }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const fetchAddresses = async (retryCount = 2) => {
    try {
      const tokenData = await SecureStore.getItemAsync('token');
      if (!tokenData) throw new Error('No token found');
      const token = JSON.parse(tokenData);

      const response = await axios.get(`${API_V1_URL}/api/v1/get-my-address`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 seconds timeout
      });

      setAddresses(response.data.addresses);
      setError('');
    } catch (err) {
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        return fetchAddresses(retryCount - 1);
      }
      let errorMessage = 'Failed to load addresses';
      if (err.message === 'Network Error') {
        errorMessage = 'Check your internet connection';
        Alert.alert('Error', errorMessage, [
          { text: 'OK', onPress: () => console.log('Alert closed') }
        ]);
      } else if (err.response?.status === 401 || err.message.includes('token')) {
        errorMessage = 'Session expired. Please re-login to your account';
        Alert.alert('Error', errorMessage, [
          { text: 'OK', onPress: () => console.log('Alert closed') }
        ]);
      }
      setError(errorMessage);
      console.error('Error fetching addresses:', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses(2); // Retry up to 2 times
  }, []);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    onSelect(address);
  };

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressCard,
        selectedAddress?.ad_id === item.ad_id && styles.selectedAddressCard
      ]}
      onPress={() => handleAddressSelect(item)}
    >
      <View style={styles.addressHeader}>
        <Icon
          name={selectedAddress?.ad_id === item.ad_id ? "check-circle" : "map-marker"}
          size={24}
          color={selectedAddress?.ad_id === item.ad_id ? "#22C55E" : "#0A95DA"}
        />
        <Text style={styles.addressType}>{item.type}</Text>
      </View>
      <Text style={styles.addressText}>
        {item.house_no}, {item.stree_address}
      </Text>
      <Text style={styles.addressLocation}>
        {item.city}, {item.state} - {item.pincode}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0A95DA" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchAddresses}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Where should we deliver your order?</Text>

      <View style={styles.addressList}>
        {addresses.length === 0 ? (
          <Text style={styles.emptyText}>No saved addresses found</Text>
        ) : (
          addresses.map((item) => (
            <View key={item.ad_id.toString()}>{renderAddressItem({ item })}</View>
          ))
        )}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddForm(true)}
      >
        <Icon name="plus" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      {showAddForm && (
        <AddressForm
          onClose={() => setShowAddForm(false)}
          refresh={fetchAddresses}
          onSubmit={async (newAddress) => {
            await fetchAddresses();
            setShowAddForm(false);
          }}
        />
      )}
    </View>
  );
};

export default AddressSelection;