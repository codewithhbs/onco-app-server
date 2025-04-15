import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

export default function CustomPSlide({ images, autoPlay = true, delay = 3000, height = 150, isThumb = true ,mode='contain'}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play feature: Change the image every `delay` ms
  useEffect(() => {
    if (autoPlay && images.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
      }, delay);
      return () => clearInterval(timer);
    }
  }, [autoPlay, delay, images.length]);

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Display the active image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: images[currentIndex] }} style={[styles.image, { height: height }]} resizeMode={mode} />
      </View>

      {isThumb && (

        <ScrollView horizontal={true} style={styles.thumbnailContainer} showsHorizontalScrollIndicator={false}>
          {images.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => handleThumbnailClick(index)} style={styles.thumbnailWrapper}>
              <Image source={{ uri: item }} style={[styles.thumbnail, currentIndex === index && styles.activeThumbnail]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 10,

  },
  imageContainer: {
    width: '100%',

    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  thumbnailContainer: {
    borderWidth: 0.3,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',



  },
  thumbnailWrapper: {

    marginHorizontal: 5,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 10,
    resizeMode: 'contain',

    marginVertical: 10,
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: '#0d6efd', // Highlight color for active thumbnail
  },
});
