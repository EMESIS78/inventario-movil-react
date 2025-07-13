import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProveedorCard = ({ nombre, ruc }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={32} color="#0ea5e9" />
            <View style={{ marginLeft: 10 }}>
                <Text style={styles.cardTitle}>{nombre}</Text>
                <Text style={styles.cardSubtitle}>RUC: {ruc}</Text>
            </View>
        </View>
    </View>
);

export default ProveedorCard;

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
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
});
