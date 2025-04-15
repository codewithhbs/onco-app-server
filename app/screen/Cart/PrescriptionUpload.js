import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "./styles";

const PrescriptionUpload = ({ handlePickImage, prescriptions, handleRemovePrescription }) => {
  const handleUpload = async () => {
    const data = await handlePickImage();

  };

  return (
    <View style={styles.prescriptionContainer}>
      <Text style={styles.sectionTitle}>Upload Prescription</Text>
      <Text style={styles.prescriptionNote}>
        Valid prescription is required for medicines marked with Rx
      </Text>

      <View style={styles.prescriptionList}>
        {prescriptions.map((prescription, index) => (
          <View key={index} style={styles.prescriptionItem}>
            <Image
              source={{ uri: prescription.uri }}
              style={styles.prescriptionImage}
            />
            <TouchableOpacity
              onPress={() => handleRemovePrescription(index)}
              style={styles.removePrescriptionButton}
            >
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={handleUpload} style={styles.uploadButton}>
          <Icon name="file-upload" size={32} color="#00BFA5" />
          <Text style={styles.uploadText}>Upload Prescription</Text>
          <Text style={styles.uploadSubtext}>PDF, JPG, PNG (Max 5MB)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PrescriptionUpload;
