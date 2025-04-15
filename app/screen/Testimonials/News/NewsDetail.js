import React, { useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../../components/Header/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewsDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { news } = route.params;

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header isLocation={false} isSearchShow={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: news.image }} style={styles.image} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.tagContainer}>
            <Text style={styles.tag}>{news.category}</Text>
            <Text style={styles.date}>{news.date}</Text>
          </View>

          <Text style={styles.title}>{news.title}</Text>
          <Text style={styles.body}>{news.content}</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 16,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  image: {
    width: '100%',

    resizeMode: 'contain',
    marginBottom: 24,
    height: 280,
  },
  content: {
    padding: 20,
    marginTop: -40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#0A95DA',
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    color: '#6B7280',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});

export default NewsDetail;