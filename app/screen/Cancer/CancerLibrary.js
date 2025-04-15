import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; // Make sure you import axios
import TableOfContents from './TableOfContents';
import CancerStages from './CancerStages';
import MedicineSection from './MedicineSection';
import HeroSection from './HeroSection';
import WhatIsCancer from './WhatIsCancer';
import { Symptoms } from './Symptoms';
import ExpertAdvice from './ExpertAdvice';
import ProductsList from '../C_AND_P_SCREENS/Products.list';
import { API_V1_URL } from '../../constant/API';

export default function CancerLibrary() {
    const navigation = useNavigation();

    // Define the necessary state variables
    const [loading, setLoading] = useState(false);
    const [cproduct, setCproduct] = useState([]);
    const [error, setError] = useState(null);
    const id = 1;

    const fetchCproduct = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_V1_URL}/api/v1/get-products?category=${id}`);
            setCproduct(data.data);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    }, [id]);

    // Optionally, call fetchCproduct in useEffect if you want it to run on mount or id change
    useEffect(() => {
        fetchCproduct();
    }, [fetchCproduct]);

    return (
        <ScrollView style={styles.container}>
            <HeroSection />
            <TableOfContents />
            <WhatIsCancer />
            <CancerStages />
            <Symptoms />
            <ExpertAdvice />
            <View>
                <Text style={styles.title}>Available Medicines</Text>
                <ProductsList isDShow={false} isShow={true} data={cproduct} />
            </View>
            {/* <MedicineSection navigation={navigation} /> */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1e293b'
    },
});
