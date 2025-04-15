import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    issue: '',
    description: ''
  });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Help Center</Text>
      <Text style={styles.formSubtitle}>
        We're happy to help! Choose from the drop down list and we'll be in touch
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Select an issue"
          value={formData.issue}
          onChangeText={(text) => setFormData({ ...formData, issue: text })}
        />
        <Icon name="chevron-down" size={24} color="#666" style={styles.dropdownIcon} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your issue"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit request</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactForm;