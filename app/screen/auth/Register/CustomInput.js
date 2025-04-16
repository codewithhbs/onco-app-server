import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Enhanced color scheme
const colors = {
  primary: '#4A6FFF',
  primaryLight: '#EEF1FF',
  text: '#333333',
  textLight: '#777777',
  border: '#E1E5EA',
  error: '#F44336',
  placeholder: '#A0A0A0',
  background: '#F9FAFC',
  surface: '#FFFFFF',
};

const CustomInput = ({
  label,
  icon,
  error,
  touched,
  secureTextEntry,
  value,
  onChangeText,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showError = touched && error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          showError && styles.errorInput,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? colors.primary : colors.textLight}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          autoCorrect={false}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.passwordToggle}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: Platform.OS === 'ios' ? 50 : 56,
    shadowColor: Platform.OS === 'ios' ? colors.border : null,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : null,
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : null,
    shadowRadius: Platform.OS === 'ios' ? 2 : null,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  focusedInput: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  errorInput: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: 10,
    padding: 2,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: isSmallDevice ? 14 : 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  passwordToggle: {
    padding: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomInput;