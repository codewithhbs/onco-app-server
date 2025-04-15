import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import Stats from './Stats';
import MissionVision from './MissionVision';
import Features from './Features';
import ContactSection from './ContactSection';

export default function AboutScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={{ uri: 'https://oncohealthmart.com/uploads/logo_upload/7fa9f9663d50df6b0aa69f4689663229.jpeg' }}
                        style={styles.heroImage}
                    />
                    <Text style={styles.heroTitle}>
                        Welcome to Onco Health Mart
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Your Trusted Online Pharmacy Partner
                    </Text>
                </View>

                {/* Introduction */}
                <View style={styles.introSection}>
                    <Text style={styles.introText}>
                        We are an online pharmacy that brings to you a comprehensive approach to medicine and wellness.
                        With more than 10 years of experience and PAN India reach, we are the preferred online pharmacy store.
                    </Text>
                </View>

                <Stats />
                <MissionVision />
                <Features />
                <ContactSection />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff'
    },
    content: {
        padding: 16
    },
    heroSection: {
        marginBottom: 32
    },
    heroImage: {
        width: '100%',
        height: 200,
        borderRadius: 8
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e40af',
        marginTop: 16
    },
    heroSubtitle: {
        fontSize: 18,
        color: '#4b5563',
        marginTop: 8
    },
    introSection: {
        marginBottom: 32
    },
    introText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#374151'
    }
});
