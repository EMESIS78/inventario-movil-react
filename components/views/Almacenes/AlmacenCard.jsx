import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AlmacenCard = ({ nombre, ubicacion }) => (
    <TouchableOpacity activeOpacity={0.85}>
        <View style={styles.card}>
            <Ionicons name="business-outline" size={28} color="#2563eb" style={{ marginBottom: 8 }} />
            <Text style={styles.title}>{nombre}</Text>
            <Text style={styles.text}>{ubicacion}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        color: '#6b7280',
    },
});

export default AlmacenCard;

