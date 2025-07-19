import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slice/Categorey/categorey.slice';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Cards from './Cards';
import CategoriesSkeleton from './CategoriesSkeleton';
import Layout from '../Layout/Layout';

export default function AllCategories() {
    const dispatch = useDispatch();
    const { categories, loading, error } = useSelector((state) => state.categorey);




    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    if (loading) {
        return <CategoriesSkeleton />;
    }

    // if (error) {
    //     return (
    //         <View style={styles.errorContainer}>
    //             <Text style={styles.errorText}>Error: {error?.message}</Text>
    //         </View>
    //     );
    // }

    // No categories available
    if (!categories || categories.length === 0) {
        return (
            <View style={styles.noCategoriesContainer}>
                <Text>No categories available</Text>
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <Layout isSearchShow={false}>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.listWrapper}>

                    <View style={styles.gridContainer}>
                        {categories.map((item, index) => (
                            <View key={index} style={styles.cardWrapper}>
                                <Cards ComeWidth={110} data={item} />
                            </View>
                        ))}

                    </View>
                </ScrollView>
            </Layout>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listWrapper: {
        flex: 1,
        paddingHorizontal: scale(10),
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '30%', // Adjusted for 3-column layout
        marginBottom: verticalScale(10),
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: moderateScale(14),
    },
    noCategoriesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
