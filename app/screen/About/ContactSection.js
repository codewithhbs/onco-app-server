import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ContactSection() {
    const navigation = useNavigation()
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Need Help?
            </Text>
            <Text style={styles.subtitle}>
                Our customer support team is here to assist you 24/7
            </Text>
            <Button
                style={styles.button}
                title='Contact us'
                onPress={() => navigation.navigate('Contact_us')} 
            >

            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1e40af',
        padding: 24,
        borderRadius: 8
    },
    title: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8
    },
    subtitle: {
        color: '#ffffff',
        opacity: 0.9,
        marginBottom: 16
    },
    button: {
        backgroundColor: '#ffffff',
        color: '#1e40af',
        padding: 12,
        borderRadius: 8,
        fontWeight: 'bold',
        textAlign: 'center'
    }
});