import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { resetState } from '../../store/slice/auth/login.slice';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

export default function ProfileLinks({ Links }) {
    const navigation = useNavigation();
    const dispatch = useDispatch()

    const handlePress = async (route) => {
        if (route === 'Logout') {
            try {

                await SecureStore.deleteItemAsync('token');
                await SecureStore.deleteItemAsync('isSkip');
                await SecureStore.deleteItemAsync("expireTime");
                await SecureStore.deleteItemAsync("user");
                dispatch(resetState());

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'login' }],
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
            return;
        }
        navigation.navigate(route);
    };
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.linksContainer}>
                {Links.map((link, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.linkItem,
                            link.route === 'Logout' && styles.logoutItem
                        ]}
                        onPress={() => handlePress(link.route)}
                    >
                        <View style={styles.linkContent}>
                            <View style={[
                                styles.iconContainer,
                                link.route === 'Logout' && styles.logoutIcon
                            ]}>
                                <Icon
                                    name={link.icon}
                                    size={24}
                                    color={link.route === 'Logout' ? '#dc2626' : '#0A95DA'}
                                />
                            </View>
                            <Text style={[
                                styles.linkText,
                                link.route === 'Logout' && styles.logoutText
                            ]}>
                                {link.title}
                            </Text>
                        </View>
                        <Icon
                            name="chevron-right"
                            size={24}
                            color={link.route === 'Logout' ? '#dc2626' : '#666'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16,
    },
    linksContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    linkContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ebe9fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    linkText: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutIcon: {
        backgroundColor: '#fee2e2',
    },
    logoutText: {
        color: '#dc2626',
        fontWeight: '600',
    },
});