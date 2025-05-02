import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { API_V1_URL } from '../../constant/API';

const Legal = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('return');
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tabs = [
        { id: 'return', label: 'Return Policy', icon: 'keyboard-return' },
        { id: 'privacy', label: 'Privacy Policy', icon: 'shield-account' },
        { id: 'terms', label: 'Terms & Conditions', icon: 'file-document' },
    ];

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_V1_URL}/api/v1/get-content`);
            if (response.data.success) {
                setContent(response.data.data);
            }
        } catch (err) {
            setError('Failed to load content. Please try again later.');
            console.error('Error fetching content:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActiveContent = () => {
        if (!content) return '';
        const policy = content.find(item => {
            if (activeTab === 'return') return item.name.toLowerCase().includes('return');
            if (activeTab === 'privacy') return item.name.toLowerCase().includes('privacy');
            if (activeTab === 'terms') return item.name.toLowerCase().includes('terms');
            return false;
        });

        // Return HTML content with embedded CSS for font size
        return `
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, system-ui, sans-serif;
              font-size: 20px; /* Adjust font size */
              line-height: 1.6;
              color: #333;
              padding: 16px;
            }
          </style>
        </head>
        <body>
          ${policy ? policy.content : ''}
        </body>
      </html>
    `;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0A95DA" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={50} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchContent}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <SafeAreaView style={styles.container}>
                {/* Tabs */}
                <ScrollView horizontal style={styles.tabContainer} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Icon
                                name={tab.icon}
                                size={24}
                                color={activeTab === tab.id ? '#0A95DA' : '#666'}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.id && styles.activeTabText
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Content */}

            </SafeAreaView>

            <View style={styles.contentContainer}>
                <WebView
                    showsVerticalScrollIndicator={false}
                    source={{ html: getActiveContent() }}
                    style={styles.webview}
                    scalesPageToFit={true}
                    minimumFontSize={42} // Ensure minimum font size
                />
            </View>
        </>
    );
};

export default Legal;

const styles = StyleSheet.create({
    container: {

        backgroundColor: '#fff',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        marginRight: 8,
        backgroundColor: '#f9f9f9',
    },
    activeTab: {
        backgroundColor: '#F3F4F6',
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#0A95DA',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#0A95DA',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
