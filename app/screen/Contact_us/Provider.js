import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { LinearGradient } from "expo-linear-gradient"

const Provider = ({ data }) => {

    const handleWhatsApp = async () => {
        const phone = `+91${data?.contact_phone}`
        const url = Platform.OS === 'ios'
            ? `https://wa.me/${phone}`
            : `whatsapp://send?phone=${phone}`

        const supported = await Linking.canOpenURL(url)
        if (supported) {
            Linking.openURL(url)
        } else {
            Alert.alert(
                'WhatsApp Not Available',
                'WhatsApp is not installed or not supported on your device.'
            )
        }
    }

    const handleCall = async () => {
        const url = `tel:+91${data?.contact_phone}`
        const supported = await Linking.canOpenURL(url)
        if (supported) {
            Linking.openURL(url)
        } else {
            Alert.alert(
                'Call Not Supported',
                'Your device does not support making calls.'
            )
        }
    }

    const handleEmail = async () => {
        const email = data?.contact_email
        const url = `mailto:${email}`
    
        const supported = await Linking.canOpenURL(url)
        if (supported) {
            Linking.openURL(url)
        } else {
            Alert.alert(
                'Email Not Supported',
                'No email app found on your device to send the email.'
            )
        }
    }

    const ContactCard = ({ title, subtitle, icon, buttonText, onPress, colors, iconRight }) => (
        <LinearGradient
            colors={colors}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
                    <TouchableOpacity style={styles.button} onPress={onPress}>
                        <Icon name={icon} size={20} color="#FFF" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
                {iconRight && (
                    <View style={styles.rightIconContainer}>
                        <Icon name={iconRight} size={60} color="rgba(255,255,255,0.2)" />
                    </View>
                )}
            </View>
        </LinearGradient>
    )

    return (
        <View style={styles.container}>
            <ContactCard
                title="Chat With Us On WhatsApp"
                subtitle=""
                icon="whatsapp"
                buttonText="Chat"
                onPress={handleWhatsApp}
                colors={["#3baa49", "#bee3c2"]}
                iconRight="whatsapp"
            />

            <ContactCard
                title="Call Us Now!"
                subtitle={`+91 ${data?.contact_phone}`}
                icon="phone"
                buttonText="Call"
                onPress={handleCall}
                colors={["#1a5fcb", "#b3caee"]}
                iconRight="phone"
            />

            <ContactCard
                title="Email Us Your Query"
                subtitle="oncohealthmart@gmail.com"
                icon="email"
                buttonText="Email"
                onPress={handleEmail}
                colors={["#f94d4d", "#ffa8a8"]}
                iconRight="email"
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
        backgroundColor: "#fff",
    },
    card: {
        borderRadius: 20,
        marginBottom: 16,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    textContainer: {
        flex: 1,
    },
    rightIconContainer: {
        position: "absolute",
        right: 0,
        top: -10,
        opacity: 0.2,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 16,
        color: "#e9f6eb",
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#6c63ff",
        borderRadius: 25,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignSelf: "flex-start",
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    navbar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    navItem: {
        alignItems: "center",
    },
    navText: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
})

export default Provider
