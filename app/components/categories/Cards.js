import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';

export default function Cards({ data, ComeWidth }) {
    const navigation = useNavigation()
    return (
        <TouchableOpacity onPress={() => navigation.navigate('Categorey-Page', { id: data?.category_id, title: data?.category_name })} activeOpacity={0.9} style={[styles.cardContainer, { width: ComeWidth }]}>
            <Image
                source={{ uri: data?.category_image }}
                style={styles.image}
                resizeMode="cover"
            />
            <Text style={styles.categoryName}>{data?.category_name}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(8),
        overflow: 'hidden',
        marginHorizontal: moderateScale(4),
        marginVertical: verticalScale(10),
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: moderateScale(4),
        elevation: 3,

        alignItems: 'center',
        padding: moderateScale(10),
    },
    image: {
        width: scale(40),
        height: scale(40),
        borderRadius: moderateScale(40),
        marginBottom: verticalScale(8),
    },
    categoryName: {
        fontSize: moderateScale(10),
        fontWeight: '500',
        color: '#040d29',
        textAlign: 'center',
    },
});
