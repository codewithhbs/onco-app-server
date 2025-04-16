import { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import { API_V1_URL } from '../constant/API';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [loader, setLoader] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    // Fetch location data asynchronously to handle address/API request
    const fetchLocationData = async (latitude, longitude) => {
        try {
            const { data } = await axios.post(`${API_V1_URL}/Fetch-Current-Location`, {
                lat: latitude,
                lng: longitude
            });
            return data?.data?.address || 'Address not found';
        } catch (err) {
            console.error("Error Fetching Location Data:", err);
            return 'Error fetching address';
        }
    };

    // Use last available location or request a new one if necessary
    const getLocation = async () => {
        try {
            setLoader(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoader(false);
                return;
            }

            // Attempt to get the last known location
            let locationData = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
                maximumAge: 10000, // Use the last available location if it’s no older than 10 seconds
                timeout: 5000, // Timeout after 5 seconds if location is not available
            });
           

            if (!locationData?.coords) {
                setErrorMsg('Failed to retrieve coordinates');
                setLoader(false);
                return;
            }

            const { latitude, longitude } = locationData.coords;

            // Fetch weather/address info based on latitude and longitude in the background
            const address = await fetchLocationData(28.6960, 77.1526);

            setLocation({ ...locationData.coords, weather: address });
        } catch (err) {
            console.error("Error Fetching Location:", err);
            setErrorMsg(err.message || 'Failed to fetch location');
        } finally {
            setLoader(false);
        }
    };

    // Start watching location only if required
    const watchLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Watch location changes with certain intervals
            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    distanceInterval: 10, // Update every 10 meters
                    timeInterval: 5000, // Update every 5 seconds
                },
                (locationData) => {
                    console.log("Updated Location:", locationData);
                    setLocation(locationData.coords);
                }
            );
        } catch (err) {
            console.error("Error Watching Location:", err);
            setErrorMsg('Failed to watch location');
        }
    };

    // Initial setup to get location (with fallback to last available location)
    useEffect(() => {
        getLocation(); // Try getting the location on initial load
    }, []);

    return (
        <LocationContext.Provider value={{ location, errorMsg, loader, getLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
