import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SearchBar = ({ value, onChangeText }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(animation, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.spring(animation, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    };

    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.02],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                isFocused && styles.containerFocused,
                { transform: [{ scale }] },
            ]}
        >
            <View style={styles.searchSection}>
                <Icon
                    name="search-outline"
                    size={22}
                    color={isFocused ? '#0A95DA' : '#666'}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Search medicines "
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectionColor="#0A95DA"
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={() => onChangeText('')}
                        style={styles.clearButton}
                    >
                        <Icon name="close-circle" size={20} color="#0A95DA" />
                    </TouchableOpacity>
                )}
            </View>
            
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    containerFocused: {
        elevation: 8,
        shadowOpacity: 0.2,
        borderColor: '#0A95DA',
        borderWidth: 1,
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 8,
        fontWeight: '500',
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    suggestionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fafafa',
    },
    suggestionIcon: {
        marginRight: 12,
    },
    suggestionTextContainer: {
        flex: 1,
    },
    suggestionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});

export default SearchBar;