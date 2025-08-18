import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import StepIndicator from './StepIndicator';
import AddressSelection from './AddressSelection';
import PatientInfo from './PatientInfo';
import OrderSummary from './OrderSummary';
import styles from './styles';

const Billing = () => {
  const route = useRoute();
  const { cart } = route.params || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [billingData, setBillingData] = useState({
    address: null,
    patientInfo: null,
    orderDetails: {
      items: cart?.items || [],
      totalPrice: cart?.totalWithoutDiscount || 0,
      couponCode: cart?.appliedCoupon?.code || '',
      discount: cart?.appliedCoupon?.discount || 0,
      deliveryFee:cart?.deliveryFee
    }
  });

  const handleAddressSelect = (address) => {
    setBillingData(prev => ({
      ...prev,
      address
    }));
    setCurrentStep(1);
  };

  const handlePatientInfoSubmit = (patientInfo) => {
    setBillingData(prev => ({
      ...prev,
      patientInfo
    }));
    setCurrentStep(2);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <AddressSelection onSelect={handleAddressSelect} />;
      case 1:
        return <PatientInfo onSubmit={handlePatientInfoSubmit} />;
      case 2:
        return <OrderSummary cart={cart} billingData={billingData} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StepIndicator
          currentStep={currentStep}
          steps={['Delivery Address', 'Patient Details', 'Order Summary']}
        />
        {renderCurrentStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Billing;