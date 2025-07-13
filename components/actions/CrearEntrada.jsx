import React, { useState, useContext, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';
import Alert from '../customs/Alert';
import CustomDropdown from '../customs/CustomDropdown';
import LiveBarcodeScanner from '../extras/LiveBarcodeScanner';

const CrearEntrada = ({ visible, onClose, onSuccess }) => {
    const auth = useContext(AuthContext);
    const [almacen, setAlmacen] = useState('');
    const [documento, setDocumento] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [productos, setProductos] = useState([]);
    const [productoTemp, setProductoTemp] = useState({ nombre: '', codigo: '', cantidad: '' });
    const [almacenes, setAlmacenes] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [wasSuccessful, setWasSuccessful] = useState(false);

    const [scannerVisible, setScannerVisible] = useState(false);

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

    const handleChangeTemp = (field, value) => {
        setProductoTemp(prev => ({ ...prev, [field]: value }));
    };

    const showCustomAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const closeAlert = () => {
        setAlertVisible(false);

        if (wasSuccessful) {
            setAlmacen('');
            setDocumento('');
            setProveedor('');
            setProductos([]);
            onClose();
            onSuccess();
        }
    };

    const handleAddProducto = () => {
        const { nombre, codigo, cantidad } = productoTemp;

        if (!nombre.trim() || !codigo.trim() || !cantidad || isNaN(cantidad)) {
            showCustomAlert("Producto incompleto", "Completa todos los datos antes de agregar.");
            return;
        }

        setProductos([...productos, {
            nombre: nombre.trim(),
            codigo: codigo.trim(),
            cantidad: parseInt(cantidad)
        }]);

        // Limpiar inputs
        setProductoTemp({ nombre: '', codigo: '', cantidad: '' });
    };

    const handleSubmit = async () => {
        if (!almacen || !documento.trim() || !proveedor.trim()) {
            showCustomAlert("Campos incompletos", "Debes llenar todos los campos antes de continuar.");
            return;
        }

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
                p_id_proveedor: proveedor.trim(),
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

            if (index === -1) {
                // Actualiza el producto temporal
                setProductoTemp(prev => ({
                    ...prev,
                    nombre,
                    codigo,
                }));
            } else {
                // (opcional, si en el futuro vuelves a usar índices)
                const updated = [...productos];
                updated[index].nombre = nombre;
                updated[index].codigo = codigo;
                setProductos(updated);
            }
        } catch (error) {
            console.error('❌ Producto no encontrado o error en la búsqueda:', error);
        }
    };

    const handleCancel = () => {
        setAlmacen('');
        setDocumento('');
        setProveedor('');
        setProductos([]);
        onClose();
    };

    const eliminarProducto = (index) => {
        const nuevos = productos.filter((_, i) => i !== index);
        setProductos(nuevos);
    };

    return (
        <Modal visible={visible} animationType="fade">
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.title}>Crear Nueva Entrada</Text>

                    <CustomDropdown
                        label="Selecciona un almacén"
                        data={almacenes}
                        selectedValue={almacen}
                        onSelect={setAlmacen}
                    />

                    <TextInput
                        placeholder="Documento"
                        value={documento}
                        placeholderTextColor="#000000"
                        onChangeText={(text) => setDocumento(text.toUpperCase())}
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="ID Proveedor"
                        value={proveedor}
                        placeholderTextColor="#000000"
                        onChangeText={setProveedor}
                        style={styles.input}
                        keyboardType="number-pad"
                    />

                    <Text style={styles.subtitle}>Productos</Text>

                    <View style={styles.productRow}>
                        <TextInput
                            placeholder="Nombre"
                            value={productoTemp.nombre}
                            placeholderTextColor="#000000"
                            onChangeText={(text) => handleChangeTemp('nombre', text)}
                            onBlur={() => buscarProducto(-1, 'nombre', productoTemp.nombre)}
                            style={styles.inputSmall}
                        />
                        <TextInput
                            placeholder="Código"
                            value={productoTemp.codigo}
                            placeholderTextColor="#000000"
                            onChangeText={(text) => handleChangeTemp('codigo', text)}
                            onBlur={() => buscarProducto(-1, 'codigo', productoTemp.codigo)}
                            style={styles.inputSmall}
                        />
                        <TouchableOpacity onPress={() => setScannerVisible(true)} style={styles.addButton}>
                            <Text style={styles.addButtonText}>📷 Escanear código</Text>
                        </TouchableOpacity>
                        <TextInput
                            placeholder="Cantidad"
                            value={productoTemp.cantidad}
                            placeholderTextColor="#000000"
                            onChangeText={(text) => handleChangeTemp('cantidad', text)}
                            style={styles.inputSmall}
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={handleAddProducto}>
                        <Text style={styles.addButtonText}>+ Agregar otro producto</Text>
                    </TouchableOpacity>

                    <Text style={styles.subtitle}>Resumen de Productos</Text>
                    <View style={styles.table}>
                        <View style={styles.tableRowHeader}>
                            <Text style={styles.tableHeaderCell}>Nombre</Text>
                            <Text style={styles.tableHeaderCell}>Código</Text>
                            <Text style={styles.tableHeaderCell}>Cantidad</Text>
                            <Text style={styles.tableHeaderCell}>Acciones</Text>
                        </View>

                        {productos.map((producto, index) => (
                            <View key={`fila-${index}`} style={styles.tableRow}>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{producto.nombre}</Text>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{producto.codigo}</Text>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{producto.cantidad}</Text>
                                <TouchableOpacity style={styles.deleteProduct} onPress={() => eliminarProducto(index)}>
                                    <Text style={styles.tableCell}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Registrar Entrada</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                        <Text style={styles.closeText}>Cancelar</Text>
                    </TouchableOpacity>
                </ScrollView>
                <Alert
                    visible={alertVisible}
                    title={alertTitle}
                    message={alertMessage}
                    onClose={closeAlert} />
            </View>
            <LiveBarcodeScanner
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onScanned={(codigo) => setProductoTemp(prev => ({ ...prev, codigo }))}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 20,
        backgroundColor: '#fff',
        paddingBottom: 40,
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
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15
    },
    addButtonText: {
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 5,
        flex: 1
    },
    submitText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#dc3545',
        padding: 15,
        borderRadius: 5,
        flex: 1,
        marginRight: 10
    },
    closeText: {
        color: '#fff',
        textAlign: 'center',
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        overflow: 'hidden',
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    tableHeaderCell: {
        flex: 1,
        padding: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableCell: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        textAlign: 'center',
    },
    deleteProduct: {
        flex: 1,
        alignItems: 'center',
        padding: 1,
        backgroundColor: '#f44336',
        borderRadius: 5,
    },
});

export default CrearEntrada;