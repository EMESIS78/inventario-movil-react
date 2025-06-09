import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@env';

const SalidaDetalle = ({ visible, onClose, id_salida }) => {
    const [detalle, setDetalle] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible && id_salida) {
            fetchDetalle();
        }
    }, [visible, id_salida]);

    const fetchDetalle = async () => {
    try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/detalle-salida?p_id_salida=${id_salida}`);
        setDetalle(response.data.detalles);
    } catch (error) {
        console.error('❌ Error al obtener detalles de salida:', error);
    } finally {
        setLoading(false);
    }
};

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Detalle de Salida</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    {Array.isArray(detalle) && detalle.length > 0 ? (
                        detalle.map((item, index) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.label}>Producto:</Text>
                                <Text>{item.articulo}</Text>
                                <Text style={styles.label}>Cantidad:</Text>
                                <Text>{item.cantidad}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay detalles disponibles.</Text>
                    )}
                </ScrollView>
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f4f4f4',
    },
    title: {
        fontSize: 20,
        marginLeft: 10,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    card: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 5,
    },
});

export default SalidaDetalle