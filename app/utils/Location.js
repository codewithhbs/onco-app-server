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
    setErrorMsg(null);

    // Check if location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      setErrorMsg('Location services are disabled. Please enable them in settings.');
      setLoader(false);
      return;
    }

    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied.');
      setLoader(false);
      return;
    }

    let locationData;

    // Try to get last known position (super fast)
    locationData = await Location.getLastKnownPositionAsync();

    // If not available, get current position with fallback options
    if (!locationData) {
      locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Faster than BestForNavigation
        timeout: 5000, // Fail after 5 seconds
        maximumAge: 10000, // Accept location up to 10s old
      });
    }

    if (!locationData?.coords) {
      setErrorMsg('Failed to retrieve coordinates.');
      setLoader(false);
      return;
    }

    const { latitude, longitude } = locationData.coords;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    // Fetch additional location info (e.g., address or weather)
    const address = await fetchLocationData(latitude, longitude);
    setLocation({ ...locationData.coords, weather: address });

  } catch (err) {
    console.error('Error Fetching Location:', err);
    if (err?.code === 'E_LOCATION_TIMEOUT') {
      setErrorMsg('Location request timed out. Try again.');
    } else {
      setErrorMsg(err.message || 'Failed to fetch location.');
    }
  } finally {
    setLoader(false);
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
