import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';

const NotificationModal = ({ visible, notifications, onClose }) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
            <View style={styles.container}>
                <Text style={styles.title}>Notificaciones</Text>
                <ScrollView>
                    {notifications.length > 0 ? (
                        notifications.map((n, idx) => (
                            <View key={idx} style={styles.card}>
                                <Text>{n.mensaje}</Text>
                                <Text style={styles.meta}>Fecha: {n.fecha}</Text>
                                <Text style={styles.meta}>Usuario: {n.usuario}</Text>
                                <Text style={styles.meta}>Motivo: {n.motivo}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.empty}>No hay notificaciones nuevas.</Text>
                    )}
                </ScrollView>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeText}>Cerrar Notificaciones</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

export default NotificationModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    meta: {
        fontSize: 12,
        color: '#6B7280',
    },
    empty: {
        textAlign: 'center',
        color: '#6B7280',
    },
    closeBtn: {
        backgroundColor: '#DC2626',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    closeText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
