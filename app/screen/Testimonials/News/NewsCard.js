import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const NewsCard = ({ news, fadeValue }) => {
  const navigation = useNavigation();

  return (
    <Animated.View style={[styles.card, { opacity: fadeValue }]}>
      <Image source={{ uri: news.image }} style={styles.image} />
      <TouchableOpacity onPress={() => navigation.navigate('NewsDetail', { news })} style={styles.content}>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{news.category}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{news.title}</Text>
        <Text style={styles.excerpt} numberOfLines={3}>{news.excerpt}</Text>

        <TouchableOpacity
          style={styles.readMoreButton}
          onPress={() => navigation.navigate('NewsDetail', { news })}
        >
          <Text style={styles.readMoreText}>Read More</Text>
          <Icon name="arrow-right" size={16} color="#0A95DA" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  tagContainer: {
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#0A95DA',
    fontSize: 12,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    color: '#0A95DA',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default NewsCard;