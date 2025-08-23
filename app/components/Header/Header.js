import { View, Image, TouchableOpacity, StyleSheet, Text, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import logo from '../../assets/logo/onco_health_mart_logo.png';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import SideHeader from '../SideHeader/SideHeader';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationContext } from '../../utils/Location';

export default function Header({ isSearchShow = true, title = '', isLocation = true }) {
    const { CartCount } = useSelector((state) => state.cart) || {};
    const { location, getLocation, loader, errorMsg } = useContext(LocationContext);
    const [isSideHeaderOpen, setIsSideHeaderOpen] = useState(false);
    const [locationText, setLocationText] = useState('');
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // Toggle side header
    const toggleSideHeader = useCallback(() => {
        setIsSideHeaderOpen(prevState => !prevState);
    }, []);

    // Format address to fit UI
    const formatAddress = useCallback((address) => {
        if (!address) return 'Select a location';
        return address.length > 20 ? address.substring(0, 35) + '...' : address;
    }, []);

    // Handle location updates
    useEffect(() => {
        const fetchLocation = async () => {
            if (!location && isLocation) {
                await getLocation();
            }

            if (location?.weather) {
                const { postalCode, area, city } = location.weather || {};
                const formattedPostalCode = postalCode ? postalCode + ',' : '';
                const formattedArea = area ? area + ' ' : '';
                const formattedCity = city || 'Loading...';
                setLocationText(formatAddress(`${formattedPostalCode}${formattedArea}${formattedCity}`));
            } else {
                setLocationText('Select a location');
            }

            // Show error alert if location fetch fails
            if (errorMsg) {
                Alert.alert('Location Error', errorMsg, [
                    { text: 'Retry', onPress: () => getLocation() },
                    { text: 'OK' },
                ]);
            }
        };

        fetchLocation();
    }, [location, getLocation, errorMsg, isLocation]);

    return (
        <>
            <LinearGradient
                colors={['#0A95DA', '#087BB8']}
                style={[styles.safeArea, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel="Open menu"
                        activeOpacity={0.7}
                        onPress={toggleSideHeader}
                        style={styles.iconButton}
                    >
                        <Icon name="menu-outline" size={moderateScale(24)} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel="Go to home"
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Home')}
                        style={styles.logoContainer}
                    >
                        <Image source={logo} style={styles.logo} />
                    </TouchableOpacity>

                    <View style={styles.rightIcons}>
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={`Cart with ${CartCount} items`}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('Cart')}
                            style={styles.cartButton}
                        >
                            <Icon name="cart-outline" size={moderateScale(24)} color="#FFFFFF" />
                            {CartCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartCount}>{CartCount > 9 ? '9+' : CartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.searchLocationWrapper, {
                    paddingHorizontal: isLocation ? moderateScale(12) : 0,
                    paddingVertical: isLocation ? moderateScale(12) : 0,
                }]}>
                    {isLocation && (
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel="Select location"
                            activeOpacity={0.7}
                            style={styles.locationSection}
                            onPress={() => navigation.navigate("LocationSelect")}
                        >
                            <View style={styles.locationContent}>
                                {loader ? (
                                    <ActivityIndicator size="small" color="#0A95DA" />
                                ) : (
                                    <>
                                        <Icon name="location" size={moderateScale(16)} color="#0A95DA" />
                                        <View style={styles.locationTextContainer}>
                                            <Text style={styles.deliverToText}>Deliver to:</Text>
                                            <Text style={styles.locationText} numberOfLines={2}>
                                                {formatAddress(locationText)}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}

                    {isSearchShow && (
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel="Search products"
                            activeOpacity={0.7}
                            style={styles.searchBar}
                            onPress={() => navigation.navigate("Search_Page")}
                        >
                            <Icon name="search-outline" size={moderateScale(18)} color="#0A95DA" />
                            <Text style={styles.searchText}>Search medicines & health products</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

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
        backgroundColor: 'transparent',
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
        top: -moderateScale(2),
        right: -moderateScale(2),
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
        fontWeight: '600',
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
        fontWeight: '400',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchText: {
        marginLeft: moderateScale(8),
        fontSize: moderateScale(14),
        color: '#9CA3AF',
        flex: 1,
    },
});