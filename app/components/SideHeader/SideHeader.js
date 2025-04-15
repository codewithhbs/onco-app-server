import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
    ActivityIndicator,
    Dimensions,
    ScrollView,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import { logoutUser } from "../../store/slice/auth/login.slice"
import { clearUserData, fetchUserProfile } from "../../store/slice/auth/user.slice"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get("window")

export default function SideHeader({ isClosed, Open }) {
    const [slideAnim] = useState(new Animated.Value(-width))
    const [fadeAnim] = useState(new Animated.Value(0))
    const [isOverlayVisible, setIsOverlayVisible] = useState(false)
    const [loggeduser, setloggedUser] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    // const { user } = useSelector((state) => state.userData)
    const [user, setUser] = useState(null)
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const prepareApp = async () => {
        try {

            setIsLoading(true)
            const tokenData = await SecureStore.getItemAsync('token');
            const token = tokenData ? JSON.parse(tokenData) : null;

            if (token) {

                const data = await dispatch(fetchUserProfile());
                setUser(data.payload)
                setIsLoading(false)

                setloggedUser(false)
            } else {
                setIsLoading(false)
                console.error('Error during app preparation:');
            }
        } catch (error) {
            console.error('Error during app preparation:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        prepareApp()
    }, [])


    useEffect(() => {
        if (isClosed) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -width,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setIsOverlayVisible(false))
        } else {
            setIsOverlayVisible(true)
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [isClosed])

    const handlePress = async () => {
        try {
            dispatch(logoutUser())
            dispatch(clearUserData())
            navigation.reset({
                index: 0,
                routes: [{ name: "login" }],
            })
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    const closeSideMenu = () => {
        Open(true)
    }

    const links = {
        primaryLinks: [
            { title: "Home", route: "Home", icon: "home" },
            { title: "Speciality Medicines", route: "Shop", icon: "pill", showLatest: true },
            { title: "Careers", route: "Careers", icon: "briefcase" },
            // { title: "Cancer Library", route: "Cancer_Library", icon: "ribbon" },
            { title: "Testimonials", route: "Testimonials", icon: "star" },
            { title: "News", route: "News", icon: "newspaper" },
            { title: "Contact Us", route: "Contact_us", icon: "phone" },
            { title: "Legal", route: "Legal", icon: "gavel" },
        ],
        secondaryLinks: [
            { title: "Login", route: "login", icon: "login" },
            { title: "Register", route: "register", icon: "account-plus" },
        ],
        logout: [
            { title: "Profile", route: "Profile", icon: "account" },
            { title: "Logout", route: "Logout", icon: "logout", onPress: handlePress },
        ],
    }

    const renderLinks = (linkArray) => {
        return linkArray.map((link, index) => (
            <TouchableOpacity
                key={index}
                style={styles.link}
                onPress={() => {
                    closeSideMenu()
                    if (link.onPress) {
                        link.onPress()
                    } else {
                        navigation.navigate(link.route, { other: link.showLatest })
                    }
                }}
            >
                <MaterialCommunityIcons name={link.icon} size={24} color="#4dacdb" style={styles.linkIcon} />
                <Text style={styles.linkText}>{link.title}</Text>
            </TouchableOpacity>
        ))
    }

    return (
        <>
            {isOverlayVisible && (
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeSideMenu} />
                </Animated.View>
            )}

            <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
                <LinearGradient
                    colors={["#006da3", "#4dacdb"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#ffffff" />
                    ) : (
                        <>
                            <Image
                                source={{
                                    uri: `https://ui-avatars.com/api/?name=${user?.customer_name || "Guest"}&background=4dacdb&color=fff&size=256`,
                                }}
                                style={styles.image}
                            />
                            <View>
                                <Text style={styles.welcomeText}>Welcome to OncoHealth'sMart</Text>
                                <Text style={styles.userName}>{loggeduser ? "Guest" : user?.customer_name}</Text>
                            </View>
                        </>
                    )}
                </LinearGradient>

                <ScrollView style={styles.linksContainer}>
                    <View style={styles.primaryLinks}>{renderLinks(links.primaryLinks)}</View>

                    <View style={styles.separator} />

                    <View style={styles.secondaryLinks}>
                        {user ? renderLinks(links.logout) : renderLinks(links.secondaryLinks)}
                    </View>
                </ScrollView>
            </Animated.View>
        </>
    )
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 998,
    },
    sideMenu: {
        position: "absolute",
        top: 0,
        left: 0,
        width: width * 0.8,
        height: "100%",
        backgroundColor: "#fff",
        zIndex: 999,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 30,
        marginRight: 15,
    },
    welcomeText: {
        fontSize: 13,
        color: "#ffffff",
        opacity: 0.8,
    },
    userName: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#ffffff",
    },
    linksContainer: {
        flex: 1,
    },
    primaryLinks: {
        marginTop: 20,
    },
    secondaryLinks: {
        marginTop: 10,
    },
    link: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    linkIcon: {
        marginRight: 15,
    },
    linkText: {
        fontSize: 16,
        color: "#333",
    },
    separator: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 10,
        marginHorizontal: 20,
    },
})

