import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_V1_URL } from "../../../constant/API";

export default function CheckShipping({ location, shiipingAvailablity }) {

    const [userLocation, setUserLocation] = useState(location);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [lastCheckedCity, setLastCheckedCity] = useState(""); // Track the last checked city

    const checkShipping = async () => {

        if (!userLocation?.city || userLocation?.city === lastCheckedCity) return;

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_V1_URL}/api/v1/check_area_availability`,
                {
                    city: userLocation?.city,
                }
            );

            setMessage(response.data.message);
            // if(response.data.message === )
            setError("");
            setLastCheckedCity(userLocation?.city);
        } catch (error) {
            console.error("I am ", error.response?.data?.message || error.message);
            shiipingAvailablity(true)
            setError(error.response?.data?.message || "Error occurred while checking location.");
            setMessage("");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location) {
            setUserLocation(location);
            checkShipping(); // Triggering shipping check
        }
    }, [location]);

    return (
        <View style={styles.container}>
            <View style={styles.card}>

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : error ? (
                    <View style={styles.messageContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={24} color="#ff6b6b" />
                        <Text style={[styles.message, styles.errorText]}>{error}</Text>
                    </View>
                ) : (
                    <View style={styles.messageContainer}>
                        <MaterialCommunityIcons
                            name={message ? "truck-delivery" : "truck-remove"}
                            size={24}
                            color={message ? "#4ecdc4" : "#ff6b6b"}
                        />
                        <Text style={styles.message}>{message}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    card: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 16,
        shadowColor: "#000",

    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    messageContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    message: {
        fontSize: 16,
        marginLeft: 8,
    },
    errorText: {
        color: "#ff6b6b",
    },
    location: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
});
