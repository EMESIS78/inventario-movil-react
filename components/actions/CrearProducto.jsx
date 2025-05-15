import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
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
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[
                    styles.modalContainer,
                    { width: isLandscape ? '70%' : '90%', maxHeight: isLandscape ? '80%' : '90%' }
                ]}>
                    <Text style={styles.title}>Crear Producto</Text>

                    <TextInput style={styles.input} placeholder="Código" value={codigo} onChangeText={setCodigo} />
                    <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
                    <TextInput style={styles.input} placeholder="Marca" value={marca} onChangeText={setMarca} />
                    {/* Dropdown personalizado debajo de Marca */}
                    <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownVisible(true)}>
                        <Text style={styles.dropdownText}>{unidad}</Text>
                        <Ionicons name="chevron-down" size={20} color="#333" />
                    </TouchableOpacity>
                    {dropdownVisible && (
                        <View style={styles.dropdownList}>
                            <FlatList
                                data={unidades}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { setUnidad(item); setDropdownVisible(false); }}>
                                        <Text>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                    <TextInput style={styles.input} placeholder="Ubicación" value={ubicacion} onChangeText={setUbicacion} />


                    {/* Botones de acción */}
                    <View style={[
                        styles.buttonContainer,
                        { flexDirection: isLandscape ? 'row' : 'column' }
                    ]}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={() => {
                                console.log('🛑 Botón Guardar presionado');
                                handleCreateProduct();
                            }}
                        >
                            <Text style={styles.buttonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Alerta personalizada */}
            <Alert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={closeAlert} />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10
    },
    dropdown: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dropdownList: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: 'white',
        position: 'absolute',
        top: 180,
        zIndex: 10,
    },
    imagePreview: {
        width: 100,
        height: 100,
        marginVertical: 10
    },
    button: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '48%'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10
    },
    cancelButton: {
        backgroundColor: 'red'
    },
    saveButton: {
        backgroundColor: 'green'
    },
    imageButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
});

export default CrearProducto;