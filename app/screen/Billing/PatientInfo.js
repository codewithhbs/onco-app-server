import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';

const PatientInfo = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    hospitalName: '',
    doctorName: '',
    patientPhone: '',
    prescriptionNotes: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital name is required';
    }
    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required';
    }
    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.patientPhone)) {
      newErrors.patientPhone = 'Enter valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default', required = true) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={formData[field]}
        onChangeText={(text) => {
          setFormData(prev => ({ ...prev, [field]: text }));
          if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
          }
        }}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Patient Information</Text>

      {renderInput('Patient Name', 'patientName', 'Enter patient name')}
      {renderInput('Hospital Name', 'hospitalName', 'Enter hospital name', 'default',)}
      {renderInput('Doctor Name', 'doctorName', 'Enter doctor name', 'default')}
      {renderInput('Phone Number', 'patientPhone', 'Enter 10-digit phone number', 'numeric')}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Prescription Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.prescriptionNotes}
          onChangeText={(text) => setFormData(prev => ({ ...prev, prescriptionNotes: text }))}
          placeholder="Add any special instructions or notes"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Icon name="arrow-right" size={24} color="#fff" />
        <Text style={styles.submitButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PatientInfo;