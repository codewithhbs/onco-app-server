import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Careers = ({ navigation }) => {
    const handleViewProducts = () => {
        navigation.navigate("AllCategory");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Main Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Icon name="briefcase-outline" size={80} color="#0A95DA" />
                    </View>

                    <Text style={styles.title}>No Current Openings</Text>

                    <Text style={styles.description}>
                        Thank you for your interest in joining our team! While we don't have
                        any positions available at the moment, we encourage you to check
                        back later as new opportunities may arise.
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.subtitle}>
                        Meanwhile, explore our innovative healthcare solutions
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={handleViewProducts}>
                        <Icon
                            name="package-variant"
                            size={24}
                            color="#fff"
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.buttonText}>Check Our Products</Text>
                    </TouchableOpacity>

                    {/* Additional Info */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <Icon name="email-outline" size={24} color="#0A95DA" />
                            <Text style={styles.infoText}>
                                Send your resume to: careers@oncohealthmart.com
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Icon name="bell-ring-outline" size={24} color="#0A95DA" />
                            <Text style={styles.infoText}>
                                Enable notifications to get updates about new positions
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Careers;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
    headerRight: {
        width: 40, // For balance with back button
    },
    content: {
        padding: 24,
        alignItems: "center",
    },
    iconContainer: {
        marginVertical: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 16,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    divider: {
        height: 1,
        backgroundColor: "#eee",
        width: "100%",
        marginVertical: 32,
    },
    subtitle: {
        fontSize: 18,
        color: "#1a1a1a",
        textAlign: "center",
        marginBottom: 24,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A95DA",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 40,
    },
    buttonIcon: {
        marginRight: 12,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    infoContainer: {
        width: "100%",
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        padding: 20,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    infoText: {
        marginLeft: 12,
        fontSize: 14,
        color: "#4a5568",
        flex: 1,
    },
});
