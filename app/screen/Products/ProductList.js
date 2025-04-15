import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text
} from 'react-native';
import axios from 'axios';
import { ProductCard } from './ProductCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { API_V1_URL } from '../../constant/API';

export function ProductList({ whatDisplay = 'deal_of_the_day' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Memoized fetch products function
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_V1_URL}/api/v1/get-products?${whatDisplay}=1`);
      setProducts(response.data.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error fetching products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [whatDisplay]);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Memoized navigation handler
  const handleProductNavigation = useCallback((product) => {
    navigation.navigate('Product_info', { 
      id: product.product_id, 
      title: product?.product_name 
    });
  }, [navigation]);

  // Memoized refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // Memoized header title
  const headerTitle = useMemo(() => {
    switch(whatDisplay) {
      case 'deal_of_the_day':
        return "Today's Top Deal";
      case 'top_selling':
        return 'Top-Selling Products';
      default:
        return 'Check Out Our New Arrivals';
    }
  }, [whatDisplay]);

  // Memoized loading view
  const LoadingView = useMemo(() => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#0A95DA" />
    </View>
  ), []);

  // Memoized error view
  const ErrorView = useMemo(() => (
    <View style={styles.centerContainer}>
      <Icon name="alert-circle-outline" size={48} color="#EF4444" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  ), [error]);

  // Memoized product cards
  const MemoizedProductCards = useMemo(() => 
    products.map((product) => (
      <ProductCard
        key={product.product_id}
        product={product}
        onTap={() => handleProductNavigation(product)}
      />
    )), 
  [products, handleProductNavigation]
  );

  // Render logic
  if (loading) return LoadingView;
  if (error) return ErrorView;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <Text style={styles.headerSubtitle}>{products.length} items available</Text>
      </View>

      <View style={styles.productGrid}>
        {MemoizedProductCards}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
});