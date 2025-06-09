import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Image, FlatList } from 'react-native';
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
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Editar Producto</Text>
                    <Text style={styles.label}>Código:</Text>
                    <TextInput style={styles.input} value={codigo} onChangeText={setCodigo} placeholder="Ingrese el código del producto" />

                    <Text style={styles.label}>Nombre:</Text>
                    <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ingrese el nombre del producto" />

                    <Text style={styles.label}>Marca:</Text>
                    <TextInput style={styles.input} value={marca} onChangeText={setMarca} placeholder="Ingrese la marca del producto" />

                    <Text style={styles.label}>Unidad de Medida:</Text>

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

                    <Text style={styles.label}>Ubicación:</Text>
                    <TextInput style={styles.input} value={ubicacion} onChangeText={setUbicacion} placeholder="Ubicación en el almacén" />

                    {/* Imagen actual */}
                    {/* {producto?.imagen && (
                        <Image source={{ uri: `http://192.168.0.86:3000/uploads/${producto.imagen}` }} style={styles.image} />
                    )} */}

                    {/* <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                        <Text style={styles.imageButtonText}>Seleccionar Imagen</Text>
                    </TouchableOpacity> */}

                    {/* Botón de actualizar */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleActualizar}>
                        <Text style={styles.saveButtonText}>Actualizar</Text>
                    </TouchableOpacity>

                    {/* Botón de cerrar */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Alert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={closeAlert} />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    image: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginVertical: 10
    },
    imageButton: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center'
    },
    imageButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        marginTop: 10,
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
});

export default EditarProducto;