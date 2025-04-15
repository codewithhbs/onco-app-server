import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function Stats() {
    const stats = [
        { number: '10+', label: 'Years Experience' },
        { number: '1M+', label: 'Happy Customers' },
        { number: '50K+', label: 'Products' },
        { number: '28', label: 'States Covered' },
    ];
    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                    <Text style={styles.statNumber}>{stat.number}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 8
    },
    statItem: {
        width: '45%',
        marginBottom: 16,
        alignItems: 'center'
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e40af'
    },
    statLabel: {
        fontSize: 14,
        color: '#4b5563',
        TextAlign: 'center'
    }
});