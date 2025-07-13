import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Text, Button, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { decodeFromImage } from '@zxing/library';
import * as FileSystem from 'expo-file-system';

const BarcodeModal = ({ visible, onClose, onScanned }) => {
    const cameraRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (visible) {
            (async () => {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === 'granted');
                setScanning(true);
            })();
        } else {
            setScanning(false);
        }
    }, [visible]);

    const takeAndScan = async () => {
        if (!cameraRef.current || !scanning) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });

            const result = await decodeFromImage(undefined, photo.uri);
            if (result?.text) {
                setScanning(false);
                onScanned(result.text);
                onClose();
            }
        } catch (error) {
            // No se encontró código, ignoramos y seguimos
        }
    };

    useEffect(() => {
        let interval;
        if (hasPermission && scanning) {
            interval = setInterval(takeAndScan, 2000); // escanear cada 2 segundos
        }
        return () => clearInterval(interval);
    }, [hasPermission, scanning]);

    if (hasPermission === null) return null;
    if (hasPermission === false) return <Text>No se tiene acceso a la cámara</Text>;

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <Camera style={styles.camera} ref={cameraRef} />
                <View style={styles.footer}>
                    <Button title="Cancelar" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    camera: { flex: 1 },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        alignItems: 'center',
    },
});

export default BarcodeModal;
