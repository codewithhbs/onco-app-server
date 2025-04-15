import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';

// Helper function to get component name from error stack
const getComponentNameFromError = (error) => {
  if (!error || !error.stack) return 'Unknown Component';
  
  const stackLines = error.stack.split('\n');
  for (const line of stackLines) {
    if (line.includes('Component') || (line.includes('React') && line.includes('create')) || (line.match(/at [A-Z][a-zA-Z0-9]+(\.|\s)/))) {
      const match = line.match(/at ([A-Z][a-zA-Z0-9]+)/);
      if (match && match[1]) return match[1];
    }
  }
  return 'Unknown Component';
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      componentName: 'Unknown Component'
    };
  }
  
  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error
    };
  }
 
  componentDidCatch(error, errorInfo) {
    const componentName = getComponentNameFromError(error);
    this.setState({ errorInfo, componentName });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Image 
              source={{ uri: 'https://i.ibb.co/hx697Rby/crash-app-image.png' }}
              style={styles.errorImage}
              resizeMode="contain"
            />
            <Text style={styles.sorryText}>We're Sorry!</Text>
            <Text style={styles.errorText}>Something went wrong</Text>
            <View style={styles.errorDetailsContainer}>
              <Text style={styles.errorComponentText}>
                Problem occurred in: <Text style={styles.highlightText}>{this.state.componentName}</Text>
              </Text>
              <ScrollView style={styles.errorScroll}>
                <Text style={styles.errorDetails}>{this.state.error?.toString()}</Text>
              </ScrollView>
            </View>
            <Text style={styles.infoText}>
              Please clear the app cache and restart to resolve this issue.
            </Text>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  sorryText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#d64444',
    marginBottom: 20,
  },
  errorDetailsContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    maxHeight: 200,
  },
  errorComponentText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#d64444',
  },
  errorScroll: {
    maxHeight: 120,
  },
  errorDetails: {
    fontSize: 14,
    color: '#777',
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});

export default ErrorBoundary;