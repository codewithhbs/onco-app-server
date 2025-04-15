import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Image } from 'react-native';
import Axios from 'axios';
import TestimonialCard from './TestimonialCard';
import images from './happy_customer.png';
import Header from '../../components/Header/Header';
import OncomartSection from './OncomartSection';
import { API_V1_URL } from '../../constant/API';

const TestimonialSection = () => {
    const [reviews, setReviews] = useState([]);
    const [scaleValues] = useState(
        new Array(5).fill(0).map(() => new Animated.Value(0))
    );

    useEffect(() => {
        // Fetch reviews data from API
        Axios.get(`${API_V1_URL}/api/v1/getReviews`)
            .then((response) => {
                // Assuming the API returns reviews under `data`
                if (response.data && response.data.data) {
                    setReviews(response.data.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching reviews:', error);
            });

        // Animate testimonial cards
        Animated.stagger(200, scaleValues.map(scale =>
            Animated.spring(scale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        )).start();
    }, []);

    return (
        <>
            <Header isSearchShow={false} />
            <ScrollView>
                <View style={styles.container}>
                    <View>
                        <Image source={images} style={styles.Image} />
                    </View>
                 
                    <OncomartSection/>
                    <View style={styles.header}>
                        <Text style={styles.title}>What Our Customers Say</Text>
                        <Text style={styles.subtitle}>Trusted by thousands of patients and healthcare professionals</Text>
                    </View>
                    <ScrollView
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.testimonialGrid}
                    >
                        {reviews.map((testimonial, index) => (
                            <TestimonialCard
                                key={testimonial.review_id}
                                testimonial={{
                                    id: testimonial.review_id,
                                    name: testimonial.name,
                                    designation: testimonial.profession,
                                    rating: testimonial.stars,
                                    comment: testimonial.review,
                                    avatar: 'https://randomuser.me/api/portraits/men/1.jpg', // You can replace with real avatars if available
                                }}
                                scaleValue={scaleValues[index]}
                            />
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F9FAFB',
    },
    header: {
        marginTop: 14,
        alignItems: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    testimonialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 16,
    },
    Image: {
        width: '100%',
        height: 200,
        marginBottom: 16,
        borderRadius: 10,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
});

export default TestimonialSection;
