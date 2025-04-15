import React from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

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

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
    },
});

export default Skeleton;
