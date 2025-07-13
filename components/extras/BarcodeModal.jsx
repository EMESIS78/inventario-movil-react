import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Text, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const BarcodeModal = ({ visible, onClose, onScanned }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible) {
            (async () => {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(status === 'granted');
                setScanned(false);
            })();
        }
    }, [visible]);

    const handleBarCodeScanned = ({ data }) => {
        setScanned(true);
        onScanned(data); // Devuelve el código al padre
        onClose(); // Cierra el modal
    };

    if (hasPermission === null) return null;
    if (hasPermission === false) return <Text>No se tiene acceso a la cámara</Text>;

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
                <Button title="Cancelar" onPress={onClose} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-end' }
});

export default BarcodeModal;
