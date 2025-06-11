import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Image, FlatList, ScrollView } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import Alert from '../customs/Alert';

const unidades = ['UNIDAD', 'DOCENA', 'KILO', 'LITRO', 'GRAMOS'];

const EditarProducto = ({ visible, producto, onClose, onProductUpdated }) => {
    const [codigo, setCodigo] = useState(producto?.codigo || '');
    const [nombre, setNombre] = useState(producto?.nombre || '');
    const [marca, setMarca] = useState(producto?.marca || '');
    const [unidad, setUnidad] = useState('UNIDAD');
    const [ubicacion, setUbicacion] = useState(producto?.ubicacion || '');
    const [imagen, setImagen] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
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

    const handleActualizar = async () => {
        const formData = new FormData();
        formData.append('codigo', codigo);
        formData.append('nombre', nombre);
        formData.append('marca', marca);
        formData.append('unidad_medida', unidad);
        formData.append('ubicacion', ubicacion);

        if (imagen) {
            formData.append('imagen', {
                uri: imagen,
                type: 'image/jpeg',
                name: 'producto.jpg',
            });
        }

        console.log('Enviando datos:', formData);

        try {
            await axios.put(`${API_URL}/productos/${producto.id_producto}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            showCustomAlert("Éxito", 'Producto editado correctamente');
            onProductUpdated();

        } catch (error) {
            console.error('❌ Error al actualizar el producto:', error);
            showCustomAlert("Error", 'No se pudo editar el producto');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="formSheet"
            statusBarTranslucent
        >
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.title}>Editar Producto</Text>

                    <Text style={styles.label}>Código</Text>
                    <TextInput style={styles.input} value={codigo} onChangeText={setCodigo} placeholder="Ingrese código del producto" />

                    <Text style={styles.label}>Nombre</Text>
                    <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ingrese nombre del producto" />

                    <Text style={styles.label}>Marca</Text>
                    <TextInput style={styles.input} value={marca} onChangeText={setMarca} placeholder="Ingrese la marca" />

                    <Text style={styles.label}>Unidad de Medida</Text>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownVisible(!dropdownVisible)}>
                        <Text style={styles.dropdownText}>{unidad}</Text>
                        <Ionicons name="chevron-down" size={20} color="#374151" />
                    </TouchableOpacity>
                    {dropdownVisible && (
                        <View style={styles.dropdownWrapper}>
                            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                                {unidades.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setUnidad(item);
                                            setDropdownVisible(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <Text style={styles.label}>Ubicación</Text>
                    <TextInput style={styles.input} value={ubicacion} onChangeText={setUbicacion} placeholder="Ubicación en almacén" />

                    <TouchableOpacity style={styles.saveButton} onPress={handleActualizar}>
                        <Text style={styles.saveButtonText}>Actualizar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <Alert visible={alertVisible} title={alertTitle} message={alertMessage} onClose={closeAlert} />
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        padding: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        fontSize: 15,
        color: '#111827',
    },
    dropdownWrapper: {
        maxHeight: 180,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginTop: -5,
        marginBottom: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 999,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dropdownText: {
        fontSize: 15,
        color: '#111827',
    },
    dropdownList: {
        paddingVertical: 4,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#1f2937',
    },
    saveButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EditarProducto;