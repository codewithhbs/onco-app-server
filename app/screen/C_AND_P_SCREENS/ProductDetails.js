import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const ProductDetails = ({ description, benefits, storage, sideEffects }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const sections = [
    { title: "Product Details", content: description },
    { title: "Benefits", content: benefits },
    { title: "Storage", content: storage },
    { title: "Side Effects", content: sideEffects },
  ];

  const handleToggle = (index) => {
  
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {sections.map((section, index) => (
        <AccordionSection
          key={index}
          index={index}
          title={section.title}
          content={section.content}
          isExpanded={expandedIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </View>
  );
};

const AccordionSection = ({ index, title, content, isExpanded, onToggle }) => {
  if (!content) return null;

  return (
    <View style={styles.accordionSection}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#0A95DA" />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.description}>{content}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  accordionSection: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  accordionContent: {
    padding: 15,
  },
  description: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
  },
});
