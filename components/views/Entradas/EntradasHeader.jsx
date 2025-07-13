import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EntradasHeader = ({ onMenuPress }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress}>
            <Ionicons name="menu-outline" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Entradas de Insumos</Text>
        <View style={{ width: 28 }} />
    </View>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
});

export default EntradasHeader;
