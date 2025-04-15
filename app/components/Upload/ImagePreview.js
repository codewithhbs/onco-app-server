import { useState, useCallback } from "react"
import { View, Image, TouchableOpacity, StyleSheet, Platform, Modal, SafeAreaView, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const ImagePreview = ({ uri, onRemove }) => {
    const [showLargeView, setShowLargeView] = useState(false)

    const handleImagePress = useCallback(() => {
        setShowLargeView(true)
    }, [])

    const handleClosePress = useCallback(() => {
        setShowLargeView(false)
    }, [])

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleImagePress}>
                <Image source={{ uri }} style={styles.image} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <Icon name="close-circle" size={24} color="#FF4D67" />
            </TouchableOpacity>

            <Modal visible={showLargeView} transparent={true} animationType="fade" onRequestClose={handleClosePress}>
                <SafeAreaView style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClosePress}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Icon name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri }} style={styles.largeImage} resizeMode="contain" />
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: Platform.OS === "ios" ? 110 : 100,
        height: Platform.OS === "ios" ? 110 : 100,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 8,
        // overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    removeButton: {
        position: "absolute",
        top: Platform.OS === "ios" ? -8 : 0,
        right: Platform.OS === "ios" ? -8 : -6,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
        zIndex: 99,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: Platform.OS === "ios" ? 40 : 20,
        right: 20,
        zIndex: 1,
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
    },
    largeImage: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.9,
    },
})

export default ImagePreview

