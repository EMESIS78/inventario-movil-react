import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UsuarioCard = ({ usuario, index, onEditar, onEliminar }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={36} color="#2563eb" />
            <View style={{ marginLeft: 10 }}>
                <Text style={styles.cardTitle}>{index + 1}. {usuario.name}</Text>
                <Text style={styles.cardSubtitle}>{usuario.email}</Text>
            </View>
        </View>

        <Text style={styles.cardRole}>Rol: {usuario.rol}</Text>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={onEditar}>
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onEliminar}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
    cardRole: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    editButton: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
        gap: 6,
    },
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: '#ef4444',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
        gap: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default UsuarioCard;
