import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

export default function BreadCrumbs({ where, title }) {
    const breadcrumbs = ['Home', where, title];

    return (
        <View style={styles.container}>
            {breadcrumbs.map((crumb, index) => (
                <View key={index} style={styles.breadcrumbItem}>
                    <TouchableOpacity>
                        <Text style={styles.breadcrumbText}>
                            {crumb}
                        </Text>
                    </TouchableOpacity>
                    {index < breadcrumbs.length - 1 && (
                        <Text style={styles.separator}>›</Text>
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,

    },
    breadcrumbItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breadcrumbText: {
        fontSize: 10,
        color: '#003873',
        fontWeight: '500',
    },
    separator: {
        marginHorizontal: 5,
        fontSize: 16,
        color: '#6c757d',
    },
});
