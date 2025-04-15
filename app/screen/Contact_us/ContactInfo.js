import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';

const ContactInfo = () => {
  const handlePhonePress = () => {
    Linking.openURL('tel:+919212292778');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:oncohealthmart@gmail.com');
  };

  return (
    <View style={styles.infoContainer}>
      <Text style={styles.reachUsTitle}>Reach Us</Text>
      
      <View style={styles.infoItem}>
        <Icon name="map-marker" size={24} color="#0A95DA" />
        <Text style={styles.infoText}>
        4958/18, Netaji Subhash Marg, Daryaganj, Delhi-110002
        </Text>
      </View>

      <TouchableOpacity style={styles.infoItem} onPress={handlePhonePress}>
        <Icon name="phone" size={24} color="#0A95DA" />
        <Text style={styles.infoText}>+91 9212292778</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoItem} onPress={handleEmailPress}>
        <Icon name="email" size={24} color="#0A95DA" />
        <Text style={styles.infoText}>oncohealthmart@gmail.com</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactInfo;