import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Modal, Button, Alert } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { decode } from '@zxing/library';

const LiveBarcodeScanner = ({ visible, onClose, onScanned }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const cameraRef = useRef(null);

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

        try {
            // Convert frame to image format if needed
            const imageBuffer = frame.toArrayBuffer(); // This is an example, real conversion may differ
            const result = decode(imageBuffer);

            if (result?.text) {
                runOnJS(handleScanSuccess)(result.text);
            }
        } catch (error) {
            // Ignore failed attempts
        }
    }, [scanned]);

    const handleScanSuccess = (code) => {
        setScanned(true);
        onScanned(code);
        onClose();
    };

    if (!device || !hasPermission) return null;

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={visible && !scanned}
                    frameProcessor={frameProcessor}
                    frameProcessorFps={5}
                />
                <View style={styles.footer}>
                    <Button title="Cancelar" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});

export default LiveBarcodeScanner;