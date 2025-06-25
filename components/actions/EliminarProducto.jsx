import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../src/config/env';
import Alert from '../customs/Alert';

const EliminarProducto = ({ visible, producto, onClose, onProductDeleted }) => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState(''); // Título de la alerta
    const [alertMessage, setAlertMessage] = useState('');

    const showCustomAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true); // Muestra la alerta
    };

    const closeAlert = () => {
        setAlertVisible(false); // Ocultar alerta
        onClose();
    };

    if (!producto) return null;

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/productos/${producto.id_producto}`);
            showCustomAlert("Éxito", 'Producto eliminado correctamente, Por favor revise la lista de productos');
            onProductDeleted();
        } catch (error) {
            console.error('❌ Error al eliminar el producto:', error);
            showCustomAlert("Error", 'No se pudo editar el producto');
            
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Eliminar Producto</Text>
                    <Text style={styles.modalText}>¿Estás seguro de que deseas eliminar &quot;{producto.nombre}&quot;?</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.buttonText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Alerta personalizada */}
            <Alert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={closeAlert} />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 300,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default EliminarProducto;