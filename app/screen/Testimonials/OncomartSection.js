import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const OncomartSection = () => {


    const features = [
        {
            icon: 'shield-check',
            title: '₹35Cr+ Saved',
            color: '#6366F1', // Indigo
        },
        {
            icon: 'truck-fast',
            title: '3000+ Cities',
            color: '#EC4899', // Pink
        },
        {
            icon: 'medical-bag',
            title: '7000+ Medicines',
            color: '#10B981', // Emerald
        },
        {
            icon: 'label-percent',
            title: 'Up to 85% Off',
            color: '#F59E0B', // Amber
        },
    ];

    return (
        <View style={styles.container}>

            <View style={styles.cardGrid}>
                {features.map((feature, index) => (
                    <View
                        key={index}
                        style={[
                            styles.card,

                        ]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: `${feature.color}15` }]}>
                            <Icon name={feature.icon} size={32} color={feature.color} />
                        </View>
                        <Text style={styles.cardTitle}>{feature.title}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 15) / 2.5;

const styles = StyleSheet.create({
    container: {
        padding: 8,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 24,
    },
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    card: {
        width: cardWidth,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
});

export default OncomartSection;