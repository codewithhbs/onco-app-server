import React from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

// Reusable Skeleton Component
const Skeleton = ({ width, height, borderRadius = moderateScale(4), style }) => {
    return (
        <View
            style={[
                styles.skeleton,
                { width: scale(width), height: verticalScale(height), borderRadius },
                style,
            ]}
        />
    );
};

const CategoriesSkeleton = () => {
    return (
        <View style={styles.skeletonContainer}>
            {/* Skeleton for header */}
            <View style={styles.headerSkeleton}>
                <Skeleton width={150} height={20} />
            </View>

            {/* Skeleton for list items */}
            {Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={styles.cardSkeleton}>
                    <Skeleton width={60} height={60} style={styles.imageSkeleton} />
                    <Skeleton width={100} height={14} />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({

    skeleton: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
        marginBottom: moderateScale(10),
    },

    // Styles for CategoriesSkeleton Layout
    skeletonContainer: {
        padding: moderateScale(10),
        backgroundColor: '#fff',
    },
    headerSkeleton: {
        marginBottom: verticalScale(10),
    },
    cardSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(15),
    },
    imageSkeleton: {
        marginRight: moderateScale(10),
    },
});

export default CategoriesSkeleton;