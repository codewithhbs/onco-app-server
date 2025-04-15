import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import Header from '../../components/Header/Header';
import BreadCrumbs from '../C_AND_P_SCREENS/BreadCrumbs';
import ProductsList from '../C_AND_P_SCREENS/Products.list';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../components/Loader';
import Layout from '../../components/Layout/Layout';
import { API_V1_URL } from '../../constant/API';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_V1_URL}/api/v1/get-products`);
      setProducts(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  if (loading) {
    return <Loader message="Please wait, medicines are loading. This usually takes less time." />;
  }


  return (
    <Layout isSearchShow={false}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {!loading && !error && products.length > 0 && (
        <ProductsList data={products} />
      )}

      {!loading && !error && products.length === 0 && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No products available.</Text>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {

    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  noDataContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});
