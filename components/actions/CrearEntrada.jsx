import React, { useState, useContext, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';
import Alert from '../customs/Alert';
import CustomDropdown from '../customs/CustomDropdown';

const CrearEntrada = ({ visible, onClose }) => {
    const auth = useContext(AuthContext);

    const [almacen, setAlmacen] = useState('');
    const [documento, setDocumento] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [productos, setProductos] = useState([{ nombre: '', codigo: '', cantidad: '' }]);
    const [almacenes, setAlmacenes] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState(''); // Título de la alerta
    const [alertMessage, setAlertMessage] = useState('');
    const [wasSuccessful, setWasSuccessful] = useState(false);

    useEffect(() => {
        const fetchAlmacenes = async () => {
            try {
                const response = await axios.get(`${API_URL}/almacenes`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                });

                const almacenesRaw = response.data?.data ?? response.data;

                if (!Array.isArray(almacenesRaw)) {
                    console.warn('⚠️ La respuesta no es un array:', almacenesRaw);
                    return;
                }

                const data = almacenesRaw.map(alm => ({
                    label: alm.nombre,
                    value: alm.id,
                }));

                setAlmacenes(data);
            } catch (error) {
                console.error('❌ Error al cargar almacenes:', error);
            }
        };

        fetchAlmacenes();
    }, [auth.token]);


    const showCustomAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true); // Muestra la alerta
    };

    const closeAlert = () => {
        setAlertVisible(false);

        if (wasSuccessful) {
            // Limpia el formulario solo si fue exitoso
            setAlmacen('');
            setDocumento('');
            setProveedor('');
            setProductos([{ nombre: '', codigo: '', cantidad: '' }]);
            onClose(); // cierra el modal después de aceptar la alerta
        }
    };

    const handleAddProducto = () => {
        setProductos([...productos, { nombre: '', cantidad: '' }]);
    };

    const handleChangeProducto = (index, field, value) => {
        const updated = [...productos];
        updated[index][field] = value;
        setProductos(updated);
    };

    const handleSubmit = async () => {
        // Validaciones básicas
        if (!almacen || !documento.trim() || !proveedor.trim()) {
            showCustomAlert("Campos requeridos", "Debes llenar todos los campos antes de continuar.");
            return;
        }

        // Validar productos
        for (let i = 0; i < productos.length; i++) {
            const { nombre, codigo, cantidad } = productos[i];
            if (!nombre.trim() || !codigo.trim() || !cantidad || isNaN(cantidad)) {
                showCustomAlert("Producto incompleto", `Completa todos los datos del producto #${i + 1}`);
                return;
            }
        }

        try {
            const payload = {
                p_id_almacen: parseInt(almacen),
                p_documento: documento.trim(),
                p_id_proveedor: proveedor.trim(), // RUC o identificador
                p_productos: productos.map(p => ({
                    id_articulo: p.nombre.trim(),
                    codigo: p.codigo?.trim() || '',
                    cantidad: parseInt(p.cantidad),
                })),
                p_user_id: auth?.user?.id,
            };

            const response = await axios.post(`${API_URL}/registrar-entrada`, payload, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            if (response.status === 201) {
                setWasSuccessful(true);
                showCustomAlert("Éxito", 'Entrada creada correctamente');
            }
        } catch (error) {
            console.error('❌ Error al enviar entrada:', error);
            setWasSuccessful(false);
            showCustomAlert("Error", 'No se pudo crear la Entrada');
        }
    };

    const buscarProducto = async (index, tipo, valor) => {
        try {
            if (!valor.trim()) return;

            const params = tipo === 'nombre' ? { nombre: valor } : { codigo: valor };

            const response = await axios.get(`${API_URL}/productos/buscar`, {
                params,
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            const { nombre, codigo } = response.data;

            const updated = [...productos];
            updated[index].nombre = nombre;
            updated[index].codigo = codigo;
            setProductos(updated);
        } catch (error) {
            console.error('❌ Producto no encontrado o error en la búsqueda:', error);
            // Opcional: puedes mostrar una alerta si no lo encuentra
        }
    };

    const handleCancel = () => {
        setAlmacen('');
        setDocumento('');
        setProveedor('');
        setProductos([{ nombre: '', codigo: '', cantidad: '' }]);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <ScrollView style={styles.modalContent}>
                    <Text style={styles.title}>Crear Nueva Entrada</Text>

                    {/* Dropdown personalizado para seleccionar el almacén */}
                    <CustomDropdown
                        label="Selecciona un almacén"
                        data={almacenes}
                        selectedValue={almacen}
                        onSelect={setAlmacen}
                    />

                    <TextInput
                        placeholder="Documento"
                        value={documento}
                        onChangeText={(text) => setDocumento(text.toUpperCase())}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="ID Proveedor"
                        value={proveedor}
                        onChangeText={setProveedor}
                        style={styles.input}
                        keyboardType="number-pad"
                    />

                    <Text style={styles.subtitle}>Productos</Text>
                    {productos.map((producto, index) => (
                        <View key={index} style={styles.productRow}>
                            <TextInput
                                placeholder="Nombre"
                                value={producto.nombre}
                                onChangeText={(text) => handleChangeProducto(index, 'nombre', text)}
                                onBlur={() => buscarProducto(index, 'nombre', producto.nombre)}
                                style={styles.inputSmall}
                            />
                            <TextInput
                                placeholder="Código"
                                value={producto.codigo}
                                onChangeText={(text) => handleChangeProducto(index, 'codigo', text)}
                                onBlur={() => buscarProducto(index, 'codigo', producto.codigo)}
                                style={styles.inputSmall}
                            />
                            <TextInput
                                placeholder="Cantidad"
                                value={producto.cantidad}
                                onChangeText={(text) => handleChangeProducto(index, 'cantidad', text)}
                                style={styles.inputSmall}
                                keyboardType="numeric"
                            />
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addButton} onPress={handleAddProducto}>
                        <Text style={styles.addButtonText}>+ Agregar Producto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Registrar Entrada</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                        <Text style={styles.closeText}>Cancelar</Text>
                    </TouchableOpacity>
                </ScrollView>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingTop: 30,
    },
    modalContent: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 10,
        padding: 20,
        maxHeight: '90%',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subtitle: {
        fontWeight: '600',
        fontSize: 16,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    inputSmall: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 8,
        margin: 5,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#ddd',
        padding: 8,
        borderRadius: 5,
        marginTop: 5,
    },
    addButtonText: {
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 6,
        marginTop: 20,
    },
    submitText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 6,
        marginTop: 10,
    },
    closeText: {
        color: '#fff',
        textAlign: 'center',
    },
});

export default CrearEntrada;