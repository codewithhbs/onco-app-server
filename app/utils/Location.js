import { createContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { API_V1_URL } from '../constant/API';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [loader, setLoader] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    // Fetch location data from API
    const fetchLocationData = useCallback(async (latitude, longitude) => {
        try {
            const { data } = await axios.post(`${API_V1_URL}/Fetch-Current-Location`, {
                lat: latitude,
                lng: longitude,
            });
            return data?.data?.address || 'Address not found';
        } catch (err) {
            console.error("Error Fetching Location Data:", err);
            throw new Error('Failed to fetch address from server.');
        }
    }, []);

    // Get location with retry mechanism
    const getLocation = useCallback(async (retryCount = 2) => {
        try {
            setLoader(true);
            setErrorMsg(null);

            // Check if location services are enabled
            const servicesEnabled = await Location.hasServicesEnabledAsync();
            if (!servicesEnabled) {
                setErrorMsg('Location services are disabled. Please enable them in settings.');
                Alert.alert(
                    'Location Services Disabled',
                    'Please enable location services in your device settings to use this feature.',
                    [
                        { text: 'OK' },
                        { text: 'Retry', onPress: () => getLocation(retryCount - 1) },
                    ]
                );
                return;
            }

            // Request foreground permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied.');
                Alert.alert(
                    'Location Permission Denied',
                    'Please allow location access in your device settings to use this feature.',
                    [
                        { text: 'OK' },
                        { text: 'Retry', onPress: () => getLocation(retryCount - 1) },
                    ]
                );
                return;
            }

            let locationData;

            // Try to get last known position
            try {
                locationData = await Location.getLastKnownPositionAsync();
            } catch (err) {
                console.warn('Last known position unavailable:', err);
            }

            // Fallback to current position if last known is unavailable
            if (!locationData) {
                locationData = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                    timeout: 5000,
                    maximumAge: 10000,
                });
            }

            if (!locationData?.coords) {
                throw new Error('Failed to retrieve coordinates.');
            }

            const { latitude, longitude } = locationData.coords;
            console.log("Latitude:", latitude, "Longitude:", longitude);

            // Fetch address data
            const address = await fetchLocationData(latitude, longitude);
            setLocation({ ...locationData.coords, weather: address });

        } catch (err) {
            console.error('Error Fetching Location:', err);
            const errorMessage = err.message || 'Failed to fetch location.';
            setErrorMsg(errorMessage);

            // Retry if attempts remain
            if (retryCount > 0) {
                console.log(`Retrying location fetch... Attempts left: ${retryCount}`);
                setTimeout(() => getLocation(retryCount - 1), 1000);
            } else {
                Alert.alert('Location Error', errorMessage, [
                    { text: 'Retry', onPress: () => getLocation(2) },
                    { text: 'OK' },
                ]);
            }
        } finally {
            setLoader(false);
        }
    }, [fetchLocationData]);

    // Initialize location on mount
    useEffect(() => {
        getLocation();
    }, [getLocation]);

    return (
        <LocationContext.Provider value={{ location, errorMsg, loader, getLocation }}>
            {children}
        </LocationContext.Provider>
    );
};