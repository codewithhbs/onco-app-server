import React from 'react';
import { View, Text, Image, StyleSheet, Animated ,Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const {width} = Dimensions.get('window')
const TestimonialCard = ({ testimonial, scaleValue }) => {
  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }]}>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name={index < testimonial.rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFB800"
          />
        ))}
      </View>
      
      <Text style={styles.comment}>{testimonial.comment}</Text>
      
      <View style={styles.userInfo}>
        <Image source={{ uri: testimonial.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{testimonial.name}</Text>
          <Text style={styles.designation}>{testimonial.designation}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 4,
    marginVertical: 12,
    width: width / 2.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  comment: {
    fontSize: 12,
    color: '#4B5563',

    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
  },
  designation: {
    fontSize: 8,
    color: '#6B7280',
  },
});

export default TestimonialCard;