import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';

const FAQItem = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#666"
        />
      </TouchableOpacity>
      {isExpanded && (
        <Text style={styles.faqAnswerText}>{answer}</Text>
      )}
    </View>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: 'How can I check the status of my order?',
      answer: 'You can track your order status in the "My Orders" section of your account.'
    },
    {
      question: 'What is the delivery time?',
      answer: 'Standard delivery takes 2-3 business days. Express delivery is available in select areas.'
    },
    {
      question: 'How can I request cancellation of my order?',
      answer: 'You can cancel your order within 1 hour of placing it through the order details page.'
    },
    {
      question: 'Can I return my medicines?',
      answer: 'For safety reasons, we do not accept returns of medicines once delivered.'
    },
    {
      question: 'How do I modify my order?',
      answer: 'Orders can be modified within 1 hour of placing them through customer support.'
    },
    {
      question: 'I have not yet received my refund. When will I receive it?',
      answer: 'Refunds typically process within 5-7 business days, depending on your payment method.'
    }
  ];

  return (
    <View style={styles.faqContainer}>
      <Text style={styles.faqTitle}>FAQ's</Text>
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </View>
  );
};

export default FAQSection;