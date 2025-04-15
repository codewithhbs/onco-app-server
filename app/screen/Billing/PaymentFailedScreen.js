import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentFailedScreen = () => {
  const navigation = useNavigation();
  const shakeAnimation = new Animated.Value(0);
  const fadeValue = new Animated.Value(0);

  useEffect(() => {
    const shake = Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    Animated.sequence([
      shake,
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[
          styles.iconContainer,
          { transform: [{ translateX: shakeAnimation }] }
        ]}>
          <Icon name="close-circle" size={120} color="#EF4444" />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeValue }]}>
          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.subtitle}>
            We couldn't process your payment.{'\n'}Please try again.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: fadeValue }]}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })}
          >
            <Icon name="refresh" size={24} color="#fff" />
            <Text style={styles.buttonText}>Retry Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => navigation.navigate('Contact_us')}
          >
            <Icon name="headphones" size={24} color="#0A95DA" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A95DA',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportButtonText: {
    color: '#0A95DA',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentFailedScreen;