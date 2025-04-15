import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EditAddress from './EditAddress';

export default function AddressCard({ address, onDelete, onRefresh }) {
    const [showEditForm, setShowEditForm] = useState(false);

    const getAddressTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'home':
                return 'home-outline';
            case 'office':
                return 'office-building-outline';
            default:
                return 'map-marker-outline';
        }
    };

    return (
        <>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.typeContainer}>
                        <Icon 
                            name={getAddressTypeIcon(address.type)} 
                            size={20} 
                            color="#0A95DA" 
                        />
                        <Text style={styles.type}>{address.type}</Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setShowEditForm(true)}
                        >
                            <Icon name="pencil-outline" size={20} color="#0A95DA" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => onDelete(address.ad_id)}
                        >
                            <Icon name="trash-can-outline" size={20} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.details}>
                    <Text style={styles.addressText}>
                        {address.house_no}, {address.stree_address}
                    </Text>
                    <Text style={styles.addressText}>
                        {address.city}, {address.state} {address.pincode}
                    </Text>
                </View>
            </View>

            {showEditForm && (
                <EditAddress
                    visible={showEditForm}
                    address={address}
                    onClose={() => setShowEditForm(false)}
                    onSuccess={() => {
                        setShowEditForm(false);
                        onRefresh();
                    }}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    type: {
        textTransform: 'capitalize',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
    },
    deleteButton: {
        backgroundColor: '#FEE2E2',
    },
    details: {
        marginTop: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
});