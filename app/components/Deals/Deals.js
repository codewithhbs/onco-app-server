import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { View, Text, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import axios from "axios"
import { API_V1_URL } from "../../constant/API"

const { width } = Dimensions.get("window")

const DealCard = React.memo(({ deal }) => {
    const cardGradient = useMemo(() => ({
        colors: [deal.bgColor, lightenColor(deal.bgColor, 20)],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 }
    }), [deal.bgColor])

    return (
        <TouchableOpacity style={styles.cardContainer}>
            <LinearGradient
                colors={cardGradient.colors}
                start={cardGradient.start}
                end={cardGradient.end}
                style={styles.card}
            >
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: deal.textColor }]}>{deal.title}</Text>
                    <Text style={[styles.description, { color: deal.textColor }]}>{deal.description}</Text>
                    <TouchableOpacity style={[styles.button, { backgroundColor: deal.textColor }]}>
                        <Text style={[styles.buttonText, { color: deal.bgColor }]}>Shop Now</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.imageContainer, { backgroundColor: deal.bgColor }]}>
                    <Image 
                        source={{ uri: deal.image }} 
                        style={styles.image} 
                        resizeMode="cover"
                    />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
})

const PaginationDot = React.memo(({ active }) => (
    <View style={[styles.paginationDot, active ? styles.paginationDotActive : styles.paginationDotInactive]} />
))

export default function DealsSection() {
    const [deals, setDeals] = useState([])
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollViewRef = useRef(null)

    // Memoized fetch data function
    const fetchData = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_V1_URL}/api/v1/get-hot-deals?active=1`)
            setDeals(data.deals)
        } catch (error) {
            console.error("Error fetching deals:", error)
        }
    }, [])

    // Auto-scroll effect with memoized dependencies
    useEffect(() => {
        if (deals.length === 0) return

        const timer = setInterval(() => {
            setActiveIndex(prevIndex => {
                const nextIndex = prevIndex === deals.length - 1 ? 0 : prevIndex + 1
                
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollTo({ 
                        x: nextIndex * width * 0.95, 
                        animated: true 
                    })
                }
                
                return nextIndex
            })
        }, 3000)

        return () => clearInterval(timer)
    }, [deals.length])

    // Initial data fetch
    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Memoized scroll handler
    const handleScroll = useCallback((event) => {
        const contentOffset = event.nativeEvent.contentOffset
        const index = Math.round(contentOffset.x / (width * 0.9))
        setActiveIndex(index)
    }, [])

    // Memoized deal cards
    const memoizedDealCards = useMemo(() => 
        deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
        )), 
    [deals])

    // Memoized pagination dots
    const memoizedPaginationDots = useMemo(() => 
        deals.map((_, index) => (
            <PaginationDot key={index} active={index === activeIndex} />
        )), 
    [deals, activeIndex])

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Exclusive Hot Deals</Text>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {memoizedDealCards}
            </ScrollView>
            <View style={styles.paginationContainer}>
                {memoizedPaginationDots}
            </View>
        </View>
    )
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
        width: width * 0.9,
        height: 200,
        marginHorizontal: 10,
        borderRadius: 20,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    card: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    textContainer: {
        width: "50%",
        padding: 15,
    },
    imageContainer: {
        width: "55%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
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
})

// Helper function to lighten a color
function lightenColor(color, percent) {
    const num = Number.parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = ((num >> 8) & 0x00ff) + amt,
        G = (num & 0x0000ff) + amt
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
    )
}

