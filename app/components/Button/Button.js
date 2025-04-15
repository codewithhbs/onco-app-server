import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';

export default function Button({ title, style, fnc, disabled = false }) {
  return (
    <View>
      <TouchableOpacity
        disabled={disabled}
        style={[
          styles.button,
          disabled && styles.buttonDisabled, 
          style,
        ]}
        onPress={fnc} 
      >
        <Text style={[styles.buttonText, disabled && styles.textDisabled]}>
          {title || 'Button'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0088cc',
    borderRadius: 8, 
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#b5e7e6',
  },
  buttonText: {
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: 'bold', 
  },
  textDisabled: {
    color: '#d3d3d3', 
  },
});
