import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';

const StepIndicator = ({ currentStep, steps }) => {
  return (
    <View style={styles.stepContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              index <= currentStep && styles.activeStepCircle
            ]}>
              {index < currentStep ? (
                <Icon name="check" size={20} color="#fff" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  index <= currentStep && styles.activeStepNumber
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepText,
              index <= currentStep && styles.activeStepText
            ]}>
              {step}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              index < currentStep && styles.activeStepLine
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export default StepIndicator;