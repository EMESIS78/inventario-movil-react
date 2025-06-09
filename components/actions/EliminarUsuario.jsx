import React, { useContext } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '@/src/AuthContext';

const EliminarUsuario = ({ visible, usuario, onClose, onSuccess }) => {
    const { token } = useContext(AuthContext);

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/usuarios/${usuario.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
        }
    };

    if (!usuario) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>¿Eliminar a {usuario.name}?</Text>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default EliminarUsuario;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 10,
        width: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelText: {
        marginTop: 15,
        textAlign: 'center',
        color: 'gray',
    },
});