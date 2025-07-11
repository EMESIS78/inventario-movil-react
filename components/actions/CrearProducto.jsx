import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import Alert from '../customs/Alert';
import { useWindowDimensions } from 'react-native';

const unidades = ['UNIDAD', 'DOCENA', 'KILO', 'LITRO', 'GRAMOS'];

const CrearProducto = ({ visible, onClose, onProductAdded }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const [codigo, setCodigo] = useState('');
    const [nombre, setNombre] = useState('');
    const [marca, setMarca] = useState('');
    const [unidad, setUnidad] = useState('UNIDAD');
    const [ubicacion, setUbicacion] = useState('');
    const [imagen, setImagen] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState(''); // Título de la alerta
    const [alertMessage, setAlertMessage] = useState('');

    // 📸 Seleccionar imagen de la galería
    const seleccionarImagen = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImagen(result.assets[0].uri);
        }
    };

    const showCustomAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true); // Muestra la alerta
    };

    const closeAlert = () => {
        setAlertVisible(false); // Ocultar alerta
        onClose();
    };

    // 📤 Enviar datos al backend
    const handleCreateProduct = async () => {
        if (!codigo || !nombre || !marca || !unidad || !ubicacion) {
            showCustomAlert("Error", 'Todos los campos son obligatorios');
            setAlertVisible(true);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('codigo', codigo);
            formData.append('nombre', nombre);
            formData.append('marca', marca);
            formData.append('unidad_medida', unidad);
            formData.append('ubicacion', ubicacion);

            if (imagen) {
                const fileName = imagen.split('/').pop();
                const fileType = fileName.split('.').pop();
                formData.append('imagen', {
                    uri: imagen,
                    name: fileName,
                    type: `image/${fileType}`,
                });
            }

            console.log('Enviando datos:', formData);

            await axios.post(`${API_URL}/productos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showCustomAlert("Éxito", 'Producto creado correctamente');
            onProductAdded()
        } catch (error) {
            console.error('❌ Error al crear producto:', error);
            showCustomAlert("Error", 'No se pudo crear el producto');
        }
    };

    const handleCancel = () => {
        setCodigo('');
        setNombre('');
        setMarca('');
        setUnidad('UNIDAD');
        setUbicacion('');
        setImagen(null);
        setDropdownVisible(false);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="formSheet" statusBarTranslucent>
            <View style={styles.fullscreen}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.title}>Crear Producto</Text>

                    <TextInput style={styles.input} placeholder="Código" placeholderTextColor="#000000" value={codigo} onChangeText={setCodigo} />
                    <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#000000" value={nombre} onChangeText={setNombre} />
                    <TextInput style={styles.input} placeholder="Marca" placeholderTextColor="#000000" value={marca} onChangeText={setMarca} />

                    {/* Dropdown personalizado */}
                    <Text style={styles.label}>Unidad de Medida</Text>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownVisible(!dropdownVisible)}>
                        <Text style={styles.dropdownText}>{unidad || 'Seleccionar unidad'}</Text>
                        <Ionicons name="chevron-down" size={20} color="#374151" />
                    </TouchableOpacity>
                    {dropdownVisible && (
                        <View style={styles.dropdownWrapper}>
                            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
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

                    <TextInput style={styles.input} placeholder="Ubicación" placeholderTextColor="#000000" value={ubicacion} onChangeText={setUbicacion} />

                    {/* Botón para subir imagen */}
                    {/* <TouchableOpacity style={styles.imageButton} onPress={seleccionarImagen}>
                        <Ionicons name="image-outline" size={20} color="#fff" />
                        <Text style={styles.imageButtonText}>Seleccionar Imagen</Text>
                    </TouchableOpacity> */}

                    {/* Vista previa de la imagen */}
                    {/* {imagen && (
                        <Image source={{ uri: imagen }} style={styles.imagePreview} />
                    )} */}

                    {/* Botones de acción */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleCreateProduct}>
                            <Text style={styles.buttonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <Alert visible={alertVisible} title={alertTitle} message={alertMessage} onClose={closeAlert} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 20,
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
        fontSize: 15,
        marginBottom: 12,
        color: '#111827',
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
    dropdownWrapper: {
        maxHeight: 180,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        zIndex: 999,
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
    imageButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    imageButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ef4444',
    },
    saveButton: {
        backgroundColor: '#2563eb',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default CrearProducto;