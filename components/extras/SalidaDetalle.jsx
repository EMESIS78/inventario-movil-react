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
        <Modal visible={visible} animationType="slide" statusBarTranslucent>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalle de Salida</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.content}>
                        {Array.isArray(detalle) && detalle.length > 0 ? (
                            detalle.map((item, index) => (
                                <View key={index} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Ionicons name="cube-outline" size={20} color="#2563eb" />
                                        <Text style={styles.cardTitle}>{item.articulo}</Text>
                                    </View>
                                    <View style={styles.cardDetailRow}>
                                        <Text style={styles.detailLabel}>Cantidad:</Text>
                                        <Text style={styles.detailValue}>{item.cantidad}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay detalles disponibles.</Text>
                        )}
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        elevation: 4,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
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
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderLeftWidth: 5,
        borderLeftColor: '#2563eb',
    },
    label: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
        marginTop: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 8,
    },

    cardDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },

    detailLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },

    detailValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
    },
    value: {
        fontSize: 15,
        color: '#1f2937',
        marginBottom: 4,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#6b7280',
        marginTop: 40,
    },
});

export default SalidaDetalle