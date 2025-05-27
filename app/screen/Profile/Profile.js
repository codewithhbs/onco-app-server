import { View, Text, Dimensions, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import { useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import ProfileHeader from './ProfileHeader';
import ProfileLinks from './ProfileLinks';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Layout from '../../components/Layout/Layout';

const { width, height } = Dimensions.get('window');

export default function Profile() {
    const { user } = useSelector((state) => state.userData);

    const Links = [
        { title: 'Edit Profile', route: 'Edit-Profile', icon: 'pen' },
        { title: 'My Orders', route: 'Orders', icon: 'package-variant' },
        { title: 'Prescriptions', route: 'Prescriptions', icon: 'file-document-outline' },
        { title: 'Address Book', route: 'AddressBook', icon: 'book-outline' },
        { title: 'Legal', route: 'Legal', icon: 'lock-outline' },
        { title: 'Help & Support', route: 'Contact_us', icon: 'help-circle-outline' },
        { title: 'About Us', route: 'About', icon: 'information-outline' },

        { title: 'Logout', route: 'Logout', icon: 'logout-variant' },
        // { title: 'Delete My Account', route: 'delete', icon: 'close' }

    ];

    if (!user) {
        return <Loader message='Profile Is loading Please Wait!' />;
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                <Layout isLocation={false} isSearchShow={false}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <ProfileHeader details={user} />
                        <ProfileLinks Links={Links} />
                    </ScrollView>
                </Layout>

            </SafeAreaView>
        </SafeAreaProvider>
    );
}