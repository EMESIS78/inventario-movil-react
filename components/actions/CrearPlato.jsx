import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../src/config/env';
import { useWindowDimensions } from 'react-native';
import Alert from '../customs/Alert';

const CrearPlato = ({ visible, onClose, onCreated }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const [nombre, setNombre] = useState('');
    const [imagen, setImagen] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [insumos, setInsumos] = useState([{ id_producto: '', cantidad_requerida: '' }]);
    const [dropdownVisibleIndex, setDropdownVisibleIndex] = useState(null);
    const [productos, setProductos] = useState([]);
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

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await axios.get(`${API_URL}/productos`);
                setProductos(res.data);
            } catch (err) {
                console.error('Error al obtener productos:', err);
            }
        };
        fetchProductos();
    }, []);

    const seleccionarImagen = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            const asset = result.assets[0];
            const fileName = asset.uri.split('/').pop();
            const fileType = asset.mimeType || 'image/jpeg';

            setImagen({
                uri: asset.uri,
                name: fileName,
                type: fileType,
            });
        }
    };

    const handleAgregarInsumo = () => {
        setInsumos([...insumos, { id_producto: '', cantidad_requerida: '' }]);
    };

    const handleEliminarInsumo = (index) => {
        const nuevosInsumos = insumos.filter((_, i) => i !== index);
        setInsumos(nuevosInsumos);
    };

    const handleChangeInsumo = (index, campo, valor) => {
        const nuevosInsumos = [...insumos];
        nuevosInsumos[index][campo] = valor;
        setInsumos(nuevosInsumos);
    };

    const handleGuardar = async () => {
        if (!nombre || !precio || insumos.some(i => !i.id_producto || !i.cantidad_requerida)) {
            Alert.alert('Error', 'Completa todos los campos antes de guardar');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('descripcion', descripcion);
            formData.append('precio', parseFloat(precio));
            formData.append('insumos', JSON.stringify(insumos.map(i => ({
                id_producto: i.id_producto,
                cantidad_requerida: parseFloat(i.cantidad_requerida)
            }))));

            if (imagen) {
                formData.append('imagen', {
                    uri: imagen.uri,
                    name: imagen.name,
                    type: imagen.type,
                });
            }

            await axios.post(`${API_URL}/platos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            showCustomAlert('Éxito', 'Plato creado correctamente');
            onCreated();
            onClose();
            setNombre('');
            setDescripcion('');
            setPrecio('');
            setInsumos([{ id_producto: '', cantidad_requerida: '' }]);
            setImagen(null);
        } catch (error) {
            console.error('Error al guardar el plato:', error);
            showCustomAlert('Error', 'No se pudo guardar el plato');
        }
    };
    const productoOptions = productos.map((prod) => ({
        label: prod.nombre,
        value: prod.id_producto,
    }));

    return (
        <Modal visible={visible} animationType="fade">
            <View style={{ flex: 1 }}>

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                >
                    <Text style={styles.title}>Crear Nuevo Plato</Text>

                    <TextInput
                        placeholder="Nombre del plato"
                        value={nombre}
                        onChangeText={setNombre}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Descripción"
                        value={descripcion}
                        onChangeText={setDescripcion}
                        style={styles.input}
                        multiline
                    />

                    <TextInput
                        placeholder="Precio (€)"
                        value={precio}
                        onChangeText={setPrecio}
                        style={styles.input}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={seleccionarImagen} style={styles.addButton}>
                        <Text style={styles.addButtonText}>
                            {imagen ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                        </Text>
                    </TouchableOpacity>

                    {imagen && (
                        <Image
                            source={{ uri: imagen.uri }}
                            style={{ width: 100, height: 100, marginVertical: 10, borderRadius: 8 }}
                        />
                    )}

                    <Text style={styles.sectionTitle}>Insumos</Text>
                    {insumos.map((insumo, index) => (
                        <View key={index} style={{ ...styles.insumoContainer, marginBottom: index === insumos.length - 1 ? 10 : 0 }}>
                            <View style={{ flex: 2 }}>
                                <TouchableOpacity
                                    onPress={() => setDropdownVisibleIndex(index)}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#ccc',
                                        padding: 10,
                                        borderRadius: 8,
                                        backgroundColor: '#fff'
                                    }}
                                >
                                    <Text>
                                        {
                                            productos.find(p => p.id_producto === insumo.id_producto)?.nombre
                                            || 'Insumo'
                                        }
                                    </Text>
                                </TouchableOpacity>

                                {dropdownVisibleIndex === index && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 50,
                                            left: 0,
                                            right: 0,
                                            backgroundColor: '#fff',
                                            borderWidth: 1,
                                            borderColor: '#ccc',
                                            borderRadius: 8,
                                            zIndex: 999,
                                        }}
                                    >
                                        <ScrollView style={{ maxHeight: 150 }}>
                                            {productoOptions.map(option => (
                                                <TouchableOpacity
                                                    key={option.value}
                                                    onPress={() => {
                                                        handleChangeInsumo(index, 'id_producto', option.value);
                                                        setDropdownVisibleIndex(null);
                                                    }}
                                                    style={{
                                                        padding: 10,
                                                        borderBottomWidth: 1,
                                                        borderBottomColor: '#eee'
                                                    }}
                                                >
                                                    <Text>{option.label}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <TextInput
                                placeholder="Cantidad"
                                value={insumo.cantidad_requerida.toString()}
                                onChangeText={(text) => handleChangeInsumo(index, 'cantidad_requerida', text)}
                                style={styles.inputSmall}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity onPress={() => handleEliminarInsumo(index)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>X</Text>
                            </TouchableOpacity>

                        </View>
                    ))}

                    <TouchableOpacity onPress={handleAgregarInsumo} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Agregar Insumo</Text>
                    </TouchableOpacity>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleGuardar} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
    scrollContainer: {
        padding: 20,
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    modalContainer: {
        width: '90%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10
    },
    insumoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 10,
        marginBottom: 15
    },
    inputSmall: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8
    },
    addButton: {
        backgroundColor: '#0a84ff',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    removeButton: {
        backgroundColor: '#ff3b30',
        padding: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    removeButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: 'center'
    },
    saveButton: {
        backgroundColor: '#34c759',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center'
    },
    cancelButtonText: {
        color: '#000',
        fontWeight: 'bold'
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});

export default CrearPlato;