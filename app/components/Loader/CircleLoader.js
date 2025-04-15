import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const CircleLoader = () => {
  const [animations] = useState(
    Array.from({ length: 8 }).map(() => new Animated.Value(0)) // Create 8 Animated Values
  );

  useEffect(() => {
    const pulseAnimation = () => {
      Animated.stagger(
        100,
        animations.map((animation) =>
          Animated.loop(
            Animated.sequence([
              Animated.timing(animation, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(animation, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }),
            ])
          )
        )
      ).start();
    };

    pulseAnimation();
  }, [animations]);

  return (
    <View style={styles.loaderContainer}>
      <View style={styles.row}>
        {animations.slice(0, 4).map((animation, index) => (
          <Animated.View
            key={index}
            style={[styles.circle, { opacity: animation }]}
          />
        ))}
      </View>
      <View style={styles.row}>
        {animations.slice(4, 8).map((animation, index) => (
          <Animated.View
            key={index + 4} // Adjust index for the second row
            style={[styles.circle, { opacity: animation }]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    loaderContainer: {
        alignItems: 'center',
  
        width: "100%",
      },
      row: {
        flexDirection: 'row',      
        justifyContent: 'space-between', 
        gap:40,
        marginVertical: 5,        
      },
      circle: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#D1D5DB', // Grey color for the circles
      },
});

export default CircleLoader;
