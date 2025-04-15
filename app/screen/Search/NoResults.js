import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const NoResults = ({ searchQuery }) => {
  return (
    <View style={styles.container}>
      <Icon name="search" size={48} color="#666" style={styles.icon} />
      {searchQuery.length >= 3 ? (
        <>
          <Text style={styles.title}>No Results Found</Text>
          <Text style={styles.message}>
            We couldn't find any products matching "{searchQuery}"
          </Text>
        </>
      ) : searchQuery.length > 0 ? (
        <Text style={styles.message}>
          Please enter at least 2 characters to search
        </Text>
      ) : (
        <Text style={styles.message}>
          Start typing to search for products
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NoResults;