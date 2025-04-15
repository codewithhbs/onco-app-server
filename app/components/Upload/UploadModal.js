import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UploadModal = ({ visible, onClose, onUpload, onCamera }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Upload Prescription</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.option} onPress={onUpload}>
                        <Icon name="image-multiple" size={24} color="#FF4D67" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>Choose from Gallery</Text>
                            <Text style={styles.optionSubtitle}>Select multiple images from your gallery</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option} onPress={onCamera}>
                        <Icon name="camera" size={24} color="#FF4D67" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>Take Photo</Text>
                            <Text style={styles.optionSubtitle}>Capture prescription using camera</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1C',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#e7f4fb',
        borderRadius: 12,
        marginBottom: 12,
    },
    optionText: {
        marginLeft: 16,
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1C',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 14,
        color: '#666',
    },
});

export default UploadModal;
