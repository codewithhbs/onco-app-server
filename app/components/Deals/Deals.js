import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { API_V1_URL } from "../../constant/API";

const { width } = Dimensions.get("window");

const DealCard = React.memo(({ deal }) => {

    const hasTextContent = deal.title || deal.description;

    const cardGradient = useMemo(() => ({
        colors: [deal.bgColor || "#f0f0f0", lightenColor(deal.bgColor || "#f0f0f0", 20)],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 }
    }), [deal.bgColor]);

    return (
        <TouchableOpacity style={styles.cardContainer}>
            <LinearGradient
                colors={cardGradient.colors}
                start={cardGradient.start}
                end={cardGradient.end}
                style={styles.card}
            >
                {hasTextContent ? (

                    <>
                        <View style={styles.textContainer}>
                            {deal.title && (
                                <Text style={[styles.title, { color: deal.textColor || "#000" }]}>
                                    {deal.title}
                                </Text>
                            )}
                            {deal.description && (
                                <Text style={[styles.description, { color: deal.textColor || "#000" }]}>
                                    {deal.description}
                                </Text>
                            )}
                            <TouchableOpacity style={[styles.button, { backgroundColor: deal.textColor || "#000" }]}>
                                <Text style={[styles.buttonText, { color: deal.bgColor || "#fff" }]}>
                                    Shop Now
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[
                            styles.imageContainer,
                            { backgroundColor: deal.bgColor || "#f0f0f0", width: "55%" }
                        ]}>
                            {deal.image && (
                                <Image
                                    source={{ uri: deal.image }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            )}
                        </View>
                    </>
                ) : (
                    // If no text content, show only the image at full width
                    <View style={[styles.imageContainer, { width: "100%" }]}>
                        {deal.image ? (
                            <Image
                                source={{ uri: deal.image }}
                                style={styles.fullWidthImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderImage} />
                        )}
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
});

const PaginationDot = React.memo(({ active }) => (
    <View style={[
        styles.paginationDot,
        active ? styles.paginationDotActive : styles.paginationDotInactive
    ]} />
));

export default function DealsSection() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef(null);

    // Memoized fetch data function
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_V1_URL}/api/v1/get-hot-deals?active=1`);
            setDeals(data.deals || []);
            setError(null);
        } catch (error) {
            console.error("Error fetching deals:", error);
            setError("Unable to load deals");
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-scroll effect with memoized dependencies
    useEffect(() => {
        if (deals.length <= 1) return;

        const timer = setInterval(() => {
            setActiveIndex(prevIndex => {
                const nextIndex = prevIndex === deals.length - 1 ? 0 : prevIndex + 1;

                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({
                        x: nextIndex * width * 0.95,
                        animated: true
                    });
                }

                return nextIndex;
            });
        }, 3000);

        return () => clearInterval(timer);
    }, [deals.length]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleScroll = useCallback((event) => {
        if (deals.length <= 1) return;

        const contentOffset = event.nativeEvent.contentOffset;
        const index = Math.round(contentOffset.x / (width * 0.9));
        setActiveIndex(index);
    }, [deals.length]);


    if (!loading && (!deals || deals.length === 0)) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Exclusive Hot Deals</Text>

            {loading ? (
                <View style={styles.placeholderContainer} />
            ) : (
                <>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {deals.map(deal => (
                            <DealCard key={deal.id || Math.random().toString()} deal={deal} />
                        ))}
                    </ScrollView>

                    {deals.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {deals.map((_, index) => (
                                <PaginationDot key={index} active={index === activeIndex} />
                            ))}
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        marginLeft: 20,
        color: "#333",
    },
    scrollViewContent: {
        paddingHorizontal: 8,
    },
    cardContainer: {
        width: width * 0.91,
        height: 200,
        marginHorizontal: 10,
        borderRadius: 20,
        overflow: "hidden",

    },
    card: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    textContainer: {
        width: "45%",
        padding: 15,
    },
    imageContainer: {
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        fontSize: 12,
        marginBottom: 15,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        alignSelf: "flex-start",
    },
    buttonText: {
        fontWeight: "bold",
    },
    image: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
    },
    fullWidthImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    placeholderImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "#e0e0e0",
    },
    placeholderContainer: {
        width: width * 0.9,
        height: 200,
        marginHorizontal: 10,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        alignSelf: "center",
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: "#80c4e6",
    },
    paginationDotInactive: {
        backgroundColor: "#000e14",
    },
});

// Helper function to lighten a color
function lightenColor(color, percent) {
    try {
        const num = Number.parseInt(color.replace("#", ""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            B = ((num >> 8) & 0x00ff) + amt,
            G = (num & 0x0000ff) + amt;
        return (
            "#" +
            (
                0x1000000 +
                (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
                (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
                (G < 255 ? (G < 1 ? 0 : G) : 255)
            )
                .toString(16)
                .slice(1)
        );
    } catch (error) {
        return "#f0f0f0"; // Return a default color if there's an error
    }
}