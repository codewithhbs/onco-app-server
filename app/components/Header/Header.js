import { View, Image, TouchableOpacity, StyleSheet, Text, Platform, StatusBar } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { Feather } from 'react-native-vector-icons'; // Add additional icon set for variety
import logo from '../../assets/logo/onco_health_mart_logo.png';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import SideHeader from '../SideHeader/SideHeader';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient'; // You may need to install this package
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // For better handling of notches/status bars
import { LocationContext } from '../../utils/Location';

export default function Header({ isSearchShow = true, title = '', isLocation = true }) {
    const { CartCount } = useSelector((state) => state.cart) || {};
    const { location, getLocation, loader } = useContext(LocationContext)

    const [isSideHeaderOpen, setIsSideHeaderOpen] = useState(false);
    const [locationText, setLocationText] = useState('');
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();


    const toggleSideHeader = () => {
        setIsSideHeaderOpen(prevState => !prevState);
    };

    const formatAddress = (address) => {
        if (address.length > 20) {
            return address.substring(0, 35) + '...';
        }
        return address;
    };

    useEffect(() => {
        const fetchLocation = async () => {
            if (!location) {
                await getLocation();
            }

            if (location?.weather) {
                const { postalCode, area, city } = location.weather || {};
                const formattedPostalCode = postalCode ? postalCode + ',' : '';
                const formattedArea = area ? area + ' ' : '';
                const formattedCity = city || 'Loading...';

                setLocationText(formatAddress(`${formattedPostalCode}${formattedArea}${formattedCity}`));
            } else {
                setLocationText("Location data not available");
            }

        };

        fetchLocation();
    }, [location, getLocation]);


    return (
        <>
            <View style={[styles.safeArea]}>

                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={toggleSideHeader}
                        style={styles.iconButton}
                    >
                        <Icon name="menu-outline" size={moderateScale(24)} color="#0A95DA" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Home')}
                        style={styles.logoContainer}
                    >
                        <Image source={logo} style={styles.logo} />
                    </TouchableOpacity>

                    <View style={styles.rightIcons}>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('Cart')}
                            style={styles.cartButton}
                        >
                            <Icon name="cart-outline" size={moderateScale(24)} color="#0A95DA" />
                            {CartCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartCount}>{CartCount > 9 ? '9+' : CartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>


                <View style={[styles.searchLocationWrapper, {
                    paddingHorizontal: isLocation ? moderateScale(12) : moderateScale(0),
                    paddingVertical: isLocation ? moderateScale(12) : moderateScale(0),
                }]}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.locationSection}
                        onPress={() => navigation.navigate("LocationSelect")}
                    >
                        {isLocation && locationText && (

                            <View style={styles.locationContent}>
                                <Icon name="location" size={moderateScale(16)} color="#0A95DA" />
                                <View style={styles.locationTextContainer}>
                                    <Text style={styles.deliverToText}>Deliver to:</Text>
                                    <Text style={styles.locationText} numberOfLines={2}>
                                        {loader ? 'Location is Fetching ....' : formatAddress(locationText)}
                                    </Text>
                                </View>
                            </View>
                        )}

                    </TouchableOpacity>

                    {isSearchShow && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.searchBar}
                            onPress={() => navigation.navigate("Search_Page")}
                        >
                            <Icon name="search-outline" size={moderateScale(18)} color="#0A95DA" />
                            <Text style={styles.searchText}>Search medicines & health products</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Side Menu */}
            <SideHeader
                isClosed={!isSideHeaderOpen}
                Open={toggleSideHeader}
            />
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#0A95DA',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(8),
        backgroundColor: '#fff',
    },
    iconButton: {
        padding: moderateScale(6),
        borderRadius: moderateScale(8),
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: moderateScale(10),
    },
    logo: {
        height: moderateScale(35),
        width: moderateScale(110),
        resizeMode: 'contain',
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartButton: {
        padding: moderateScale(6),
        marginLeft: moderateScale(8),
        borderRadius: moderateScale(8),
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF6B6B',
        minWidth: moderateScale(18),
        height: moderateScale(18),
        borderRadius: moderateScale(9),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(4),
    },
    cartCount: {
        color: '#fff',
        fontSize: moderateScale(10),
        fontWeight: 'bold',
    },
    searchLocationWrapper: {
        backgroundColor: '#F8F9FA',



    },
    locationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: moderateScale(8),

    },
    locationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationTextContainer: {
        marginLeft: moderateScale(8),
        flex: 1,
    },
    deliverToText: {
        fontSize: moderateScale(11),
        color: '#6B7280',
    },
    locationText: {
        fontSize: moderateScale(14),
        color: '#1F2937',
        fontWeight: '500',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(8),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchText: {
        marginLeft: moderateScale(8),
        fontSize: moderateScale(14),
        color: '#9CA3AF',
        flex: 1,
    }
});