import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WhatIsCancer() {
    const keyPoints = [
        'Cancer is a disease where cells grow uncontrollably',
        'It can start almost anywhere in the body',
        'Normal cells grow and divide in a controlled way',
        'Cancerous cells ignore signals to stop growing'
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What is Cancer?</Text>
            <Text style={styles.description}>
                Cancer is a condition where cells in a specific part of the body grow and reproduce uncontrollably.
                These cancerous cells can invade and destroy surrounding healthy tissue, including organs.
            </Text>

            <View style={styles.keyPointsContainer}>
                <Text style={styles.subtitle}>Key Points to Understand:</Text>
                {keyPoints.map((point, index) => (
                    <View key={index} style={styles.pointContainer}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.point}>{point}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#ffffff',
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12
    },
    description: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 24,
        marginBottom: 20
    },
    keyPointsContainer: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 8
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 12
    },
    pointContainer: {
        flexDirection: 'row',
        marginBottom: 8
    },
    bullet: {
        fontSize: 16,
        color: '#3b82f6',
        marginRight: 8
    },
    point: {
        fontSize: 16,
        color: '#4b5563',
        flex: 1
    }
});