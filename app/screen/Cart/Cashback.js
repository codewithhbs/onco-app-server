import { View, Text, TouchableOpacity } from 'react-native';
import React, { useRef } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function Cashback({ onApply, onRemove ,alreadyApplies }) {
    const navigation = useNavigation()
    const onApplyRef = useRef(onApply);
    const onRemoveRef = useRef(onRemove);
    
    return (
        <View style={{ padding: 8, backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 2, marginBottom: 15 }}>

            {/* Cashback Section */}
            <TouchableOpacity onPress={() => navigation.navigate('AllCoupons', {
                onApply: onApplyRef.current,
                onRemove: onRemoveRef.current,
                alreadyApplies:alreadyApplies
            })} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="brightness-percent" size={14} color="#ff5722" />
                    <Text style={{ marginLeft: 5, fontSize: 18, fontWeight: 'bold', color: '#333' }}>Cashback</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#ff5722' }}>Apply</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 10 }} />

            {/* Coupons Section */}
            <TouchableOpacity onPress={() => navigation.navigate('AllCoupons', {
                onApply: onApplyRef.current,
                onRemove: onRemoveRef.current,
                alreadyApplies:alreadyApplies
            })} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: '#0A95DA', fontWeight: '500' }}>View All Coupons</Text>
                <Icon name="chevron-right" size={12} color="#0A95DA" />
            </TouchableOpacity>

        </View>
    );
}
