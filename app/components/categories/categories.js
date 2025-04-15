import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slice/Categorey/categorey.slice';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Cards from './Cards';
import CategoriesSkeleton from './CategoriesSkeleton';
import { useNavigation } from '@react-navigation/native';

export default function Categories() {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    // Memoized selector with stable reference
    const { categories, loading, error } = useSelector((state) => state.categorey, (prev, next) =>
        prev.categories === next.categories &&
        prev.loading === next.loading &&
        prev.error === next.error
    );

    // Stable dispatch with cleanup
    useEffect(() => {
        const fetchAction = dispatch(fetchCategories());

        return () => {
            if (fetchAction.abort) {
                fetchAction.abort();
            }
        };
    }, [dispatch]);

    // Memoize navigation handler
    const navigateToAllCategories = useCallback(() => {
        navigation.navigate('AllCategory');
    }, [navigation]);

    // Memoize first 4 categories
    const displayCategories = useMemo(() =>
        categories?.slice(0, 4) || [],
        [categories]
    );

    // Memoize category cards rendering
    const renderCategoryCards = useMemo(() =>
        displayCategories.map((item, index) => (
            <View key={item.id || `category-${index}`} style={styles.cardWrapper}>
                <Cards data={item} />
            </View>
        )),
        [displayCategories]
    );

    // Loading state
    if (loading) {
        return <CategoriesSkeleton />;
    }

    // Error state
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    // No categories available
    if (!categories || categories.length === 0) {
        return (
            <View style={styles.noCategoriesContainer}>
                <Text>No categories available</Text>
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Top Speciality Medicines</Text>
                </View>
                <View style={styles.seeAllContainer}>
                    <TouchableOpacity
                        onPress={navigateToAllCategories}
                        style={styles.seeAllButton}
                    >
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ paddingHorizontal: 5 }}>
                <View style={styles.listContainer}>
                    {displayCategories.length === 0 ? (
                        <Text style={styles.emptyText}>No categories found</Text>
                    ) : (
                        <View style={styles.gridContainer}>
                            {renderCategoryCards}
                        </View>
                    )}
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',

        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: scale(14),
        padding: moderateScale(7),
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
    header: {
        flex: 1,
    },
    headerText: {
        fontSize: moderateScale(16),
        fontWeight: '500',
        color: '#040d29',
    },
    seeAllContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    seeAllButton: {
        paddingVertical: verticalScale(4),
    },
    seeAllText: {
        textDecorationLine: 'underline',
        color: '#0A95DA',
        fontSize: moderateScale(14),
    },
    listContainer: {
        padding: 0,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'start',
    },
    cardWrapper: {
        width: '25%',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 20,
    },
});
