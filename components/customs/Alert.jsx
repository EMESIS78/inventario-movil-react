import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const Alert = ({ visible, message, onClose, title, confirmText = "Aceptar", }) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <Animatable.View animation="zoomIn" duration={500} style={styles.alertContainer}>
                    <Text style={styles.alertTitle}>{title}</Text>
                    <Text style={styles.alertMessage}>{message}</Text>
                    <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
                        <Text style={styles.confirmButtonText}>{confirmText}</Text>
                    </TouchableOpacity>
                </Animatable.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertContainer: {
        width: '80%',
        backgroundColor: '#dde9e0',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
        marginBottom: 20,
    },
    confirmButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Alert;