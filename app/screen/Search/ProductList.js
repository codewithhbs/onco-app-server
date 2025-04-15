import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ProductCard from './ProductCard';

const ProductList = ({ products }) => {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {products.map((item) => (
        <ProductCard key={item.product_id.toString()} product={item} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default ProductList;
