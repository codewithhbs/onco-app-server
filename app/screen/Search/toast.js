import React, { useEffect } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useToast } from '../../context/ToastContext';

const Toast = ({ navigation }) => {
    const { toast } = useToast();
    const translateY = new Animated.Value(-100);

    useEffect(() => {
        if (toast.visible) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
            }).start();
        } else {
            Animated.spring(translateY, {
                toValue: -100,
                useNativeDriver: true,
            }).start();
        }
    }, [toast.visible]);

    if (!toast.visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY }] }
            ]}
        >
            <Icon name="check-circle" size={24} color="#fff" />
            <Text style={styles.message}>
                <Text style={styles.productName}>{toast.productName}</Text>
                {' '}added to cart
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Cart')}
            >
                <Text style={styles.buttonText}>GO TO CART</Text>
                <Icon name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0A95DA',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 40,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    message: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        marginLeft: 12,
    },
    productName: {
        fontWeight: 'bold',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 4,
    },
});

export default Toast;