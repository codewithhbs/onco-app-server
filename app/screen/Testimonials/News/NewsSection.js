import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import NewsCard from './NewsCard';
import Layout from '../../../components/Layout/Layout';
import { API_V1_URL } from '../../../constant/API';

const NewsSection = () => {
  const [newsData, setNewsData] = useState([]);
  const [fadeValues, setFadeValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);


  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_V1_URL}/api/v1/getNews`);
      const newsList = response.data.data;
      setNewsData(newsList);

      const animations = newsList.map(() => new Animated.Value(0));
      setFadeValues(animations);

      Animated.stagger(
        200,
        animations.map((fade) =>
          Animated.timing(fade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
      setError(null);
    } catch (err) {
      setError('Failed to fetch news. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, [fetchNews]);

  const renderNewsCards = useMemo(() => (
    newsData.map((item, index) => (
      <Animated.View key={item.id} style={{ opacity: fadeValues[index] }}>
        <NewsCard news={item} />
      </Animated.View>
    ))
  ), [newsData, fadeValues]);

  return (
    <Layout isSafe={false} isLocation={false} isSearchShow={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Latest News</Text>
          <Text style={styles.subtitle}>Stay updated with the latest in healthcare</Text>
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading news...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && newsData.length === 0 && !error && (
          <View style={styles.noNewsContainer}>
            <Text style={styles.noNewsText}>No news available at the moment.</Text>
          </View>
        )}

        {!loading && newsData.length > 0 && (
          <ScrollView
            contentContainerStyle={styles.newsList}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {renderNewsCards}
          </ScrollView>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
  noNewsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  noNewsText: {
    fontSize: 16,
    color: '#6B7280',
  },
  newsList: {
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default NewsSection;
