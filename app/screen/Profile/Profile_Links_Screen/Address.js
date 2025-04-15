import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/Header/Header';
import AddressCard from './AddressCard';
import AddAddress from './AddAddress';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Loader from '../../../components/Loader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native';
import { API_V1_URL } from '../../../constant/API';

export default function Address({isShow = true}) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const tokenData = await SecureStore.getItemAsync('token');
            const token = JSON.parse(tokenData);

            const response = await axios.get(`${API_V1_URL}/api/v1/get-my-address`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // console.log(response.data)
            setAddresses(response.data.addresses);
            setError('');
        } catch (err) {
            console.error('Error fetching addresses:', err);
            setError('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            const tokenData = await SecureStore.getItemAsync('token');
            const token = JSON.parse(tokenData);

            await axios.delete(`${API_V1_URL}/api/v1/delete-my-address/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAddresses(addresses.filter(addr => addr.ad_id !== addressId));
        } catch (err) {
            console.error('Error deleting address:', err);
            setError('Failed to delete address');
        }
    };

    if (loading) {
        return <Loader message="Loading addresses..." />;
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
              {isShow && (
                <Header isSearchShow={false} />
              )}  
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>My Addresses</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowAddForm(true)}
                            >
                                <Icon name="plus" size={20} color="#fff" />
                                <Text style={styles.addButtonText}>Add New</Text>
                            </TouchableOpacity>
                        </View>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Icon name="alert-circle-outline" size={24} color="#DC2626" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : addresses.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="map-marker-off-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyText}>No addresses found</Text>
                            </View>
                        ) : (
                            <View style={styles.addressList}>
                                {addresses.map((address) => (
                                    <AddressCard
                                        key={address.ad_id}
                                        address={address}
                                        onDelete={handleDeleteAddress}
                                        onRefresh={fetchAddresses}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>

                {showAddForm && (
                    <AddAddress
                        visible={showAddForm}
                        onClose={() => setShowAddForm(false)}
                        onSuccess={() => {
                            setShowAddForm(false);
                            fetchAddresses();
                        }}
                    />
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3ea9de',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        marginLeft: 4,
        fontWeight: '500',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        marginLeft: 8,
        color: '#DC2626',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    addressList: {
        gap: 16,
    },
});