import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function ProfileHeader({ details }) {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${details?.customer_name}&background=0A95DA&color=fff&size=256` }}
                        style={styles.image}
                    />
                    <View style={styles.verifiedBadge}>
                        <Icon name="check-circle" size={24} color="#0A95DA" />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{details?.customer_name}</Text>
                    <View style={styles.infoRow}>
                        <Icon name="email-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{details?.email_id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="phone-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{details?.mobile}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="map-marker-outline" size={16} color="#666" />
                        <Text style={styles.infoText} numberOfLines={2}>
                            {details?.address || 'No address provided'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#0A95DA',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 2,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
});