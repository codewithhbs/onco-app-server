import React from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';

import FAQSection from './FAQSection';
import styles from './styles';
import Provider from './Provider';
import useSettings from '../../hooks/Settingshook';

const Contact = () => {
  const { settings } = useSettings()
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.content}>
          {/* <ContactInfo /> */}
          <Provider data={settings} />
          {/* <ContactForm /> */}
          <FAQSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Contact;