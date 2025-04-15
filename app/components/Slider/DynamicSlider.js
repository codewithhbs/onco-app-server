import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, PanResponder } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function DynmaicSlider({
    autoPlay = false,
    delay = 3000,
    isUri = false,
    imagesByProp = [],
    navigationShow = true,
    heightPass = 200,
    mainWidth = '100%',
    mode = 'cover'
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [images, setImages] = useState([]);

    // Set images from props and handle edge cases
    useEffect(() => {
        if (imagesByProp.length > 0) {
            setImages(imagesByProp[0]?.src || []);
        } else {
            setImages([]);
        }
    }, [imagesByProp]);

    // Handle the autoplay feature
    useEffect(() => {
        if (autoPlay && images.length > 0) {
            const interval = setInterval(() => {
                setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, delay);
            return () => clearInterval(interval); // Cleanup interval
        }
    }, [autoPlay, images.length, delay]);

    // Logic to go to the next image
    const goToNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    // Logic to go to the previous image
    const goToPrevious = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    // PanResponder for swipe functionality
    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
            const { dx } = gestureState;
            return Math.abs(dx) > 20; // Detect horizontal swipe
        },
        onPanResponderMove: (_, gestureState) => {
            const { dx } = gestureState;
            if (dx > 50) {
                goToPrevious(); // Swipe right
            } else if (dx < -50) {
                goToNext(); // Swipe left
            }
        },
    });

    // If no images are available, display a message
    if (images.length === 0) {
        return (
            <View style={styles.container}>
                <Text>No images available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.imageContainer, { height: heightPass, width: mainWidth }]} {...panResponder.panHandlers}>
                {isUri ? (
                    // If images are URIs
                    <Image
                        source={{ uri:String(images[activeIndex]) }}
                        style={[styles.image, { resizeMode: mode }]}
                    />
                ) : (
                   
                    <Image
                        source={images[activeIndex]} 
                        style={styles.image}
                    />
                )}

                {navigationShow && (
                    <View style={styles.navigation}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={goToPrevious}
                            style={styles.navButton}>
                            <Icon name="chevron-back" size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={goToNext}
                            style={styles.navButton}>
                            <Icon name="chevron-forward" size={30} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
        alignItems: 'center',
    },
    imageContainer: {
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    navigation: {
        position: 'absolute',
        top: '30%',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 30,
        margin: 12,
        padding: 2,
        alignItems: 'center',
    },
});
