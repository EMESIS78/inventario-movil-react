import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Modal, Button, Text } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { runOnJS } from 'react-native-reanimated';

const LiveBarcodeScanner = ({ visible, onClose, onScanned }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const devices = useCameraDevices();
    const device = devices.back;

    useEffect(() => {
        const requestPermission = async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'authorized');
        };

        if (visible) {
            requestPermission();
            setScanned(false);
        }
    }, [visible]);

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        if (scanned) return;

        const barcodes = scanBarcodes(frame, [BarcodeFormat.ALL_FORMATS]);

        if (barcodes.length > 0) {
            runOnJS(handleScanSuccess)(barcodes[0].rawValue);
        }
    }, [scanned]);

    const handleScanSuccess = (code) => {
        setScanned(true);
        onScanned(code);
        onClose();
    };

    if (!device || !hasPermission) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.container}>
                    <Text style={{ color: '#fff' }}>Cámara no disponible o sin permiso</Text>
                    <Button title="Cerrar" onPress={onClose} />
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={visible && !scanned}
                    frameProcessor={frameProcessor}
                    frameProcessorFps={5}
                />
                <View style={styles.footer}>
                    <Button title="Cancelar" onPress={onClose} color="#fff" />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
});

export default LiveBarcodeScanner;