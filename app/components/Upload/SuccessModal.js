import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

const { width } = Dimensions.get("window")

const SuccessModal = ({ visible, onClose, prescriptions, uuid }) => {
    const renderItem = ({ item }) => (
        <View style={styles.imageContainer}>
            <Image source={{ uri: item }} style={styles.prescriptionImage} />
        </View>
    )

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <LinearGradient colors={["#b6dff4", "#85caed", "#043c57"]} style={styles.modalContent}>
                    <Icon name="check-circle" size={80} color="#043c57" style={styles.icon} />
                    <Text style={styles.title}>Upload Successful!</Text>
                    <Text style={styles.subtitle}>Your prescriptions have been uploaded successfully.</Text>
                    <View style={styles.uuidContainer}>
                        <Text style={styles.uuidLabel}>Prescription ID:</Text>
                        <Text style={styles.uuid}>{uuid}</Text>
                    </View>
                    <View style={styles.prescriptionList}>
                        {prescriptions.length === 0 ? (
                            <Text style={styles.emptyText}>No prescriptions found</Text>
                        ) : (
                            prescriptions.reduce((rows, item, index) => {
                                if (index % 2 === 0) {
                                    rows.push([item]);
                                } else {
                                    rows[rows.length - 1].push(item);
                                }
                                return rows;
                            }, []).map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.row}>
                                    {row.map((item, colIndex) => (
                                        <View key={colIndex} style={styles.column}>
                                            {renderItem({ item })}
                                        </View>
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Check Prescription</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: width * 0.9,
        maxHeight: "90%",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#010f16",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        color: "#010f16",
    },
    uuidContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 10,
        padding: 10,
    },
    uuidLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#010f16",
        marginRight: 10,
    },
    uuid: {
        fontSize: 16,
        color: "#010f16",
    },
    prescriptionList: {
        width: "100%",
        marginBottom: 20,
    },
    imageContainer: {
        width: "48%",
        aspectRatio: 1,
        margin: "1%",
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    prescriptionImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    closeButton: {
        marginVertical: 10,
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#032d41",
        fontWeight: "bold",
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    column: {
        flex: 1,
        marginHorizontal: 5,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 20,
    },
})

export default SuccessModal

