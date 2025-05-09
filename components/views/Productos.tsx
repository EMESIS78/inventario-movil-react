import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { AuthContext } from '../../src/AuthContext';
import axios from 'axios';
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import CrearProductos from '../actions/CrearProducto';
import EditarProducto from '../actions/EditarProductos';
import EliminarProducto from '../actions/EliminarProducto';
import { useWindowDimensions } from 'react-native'
import Dropdown from '../customs/Dropdown'

interface Producto {
    id_producto: number;
    codigo: string;
    nombre: string;
    marca: string;
    unidad_medida: string;
    ubicacion: string;
    stock: number;
}

interface Almacen {
    id: number;
    nombre: string;
}

const Productos = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation<DrawerNavProp>();
    const [modalVisible, setModalVisible] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const numColumns = isLandscape ? 3 : 1;

    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [selectedAlmacen, setSelectedAlmacen] = useState<Almacen | null>(null);
    const [productosBase, setProductosBase] = useState<Producto[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    const { user, token } = auth;

    const fetchAlmacenes = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/almacenes`);
            setAlmacenes(response.data);
            if (response.data.length > 0) setSelectedAlmacen(response.data[0]);
        } catch (error) {
            console.error('❌ Error al obtener almacenes:', error);
        }
    }, []);

    const fetchProductosBase = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/productos`);
            const productosLimpios = response.data.map(({ created_at, updated_at, ...resto }: any) => resto);
            setProductosBase(productosLimpios);
            console.log('✅ Productos base cargados');
        } catch (error) {
            console.error('❌ Error al obtener productos base:', error);
        }
    }, []);

    const fetchInventario = useCallback(async () => {
        if (!selectedAlmacen) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/inventario?id_almacen=${selectedAlmacen.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const inventario = response.data;

            const productosConStock = inventario.map((item: any) => {
                const productoBase = productosBase.find(p => p.id_producto === item.id_producto);
                return productoBase ? { ...productoBase, stock: item.stock } : null;
            }).filter(Boolean) as Producto[];

            setProductos(productosConStock);
            console.log('✅ Inventario fusionado');
        } catch (error) {
            console.error('❌ Error al obtener inventario:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedAlmacen, productosBase, token]);

    useFocusEffect(
        useCallback(() => {
            fetchAlmacenes();
            fetchProductosBase();
        }, [fetchAlmacenes, fetchProductosBase,search])
    );

    useEffect(() => {
        if (productosBase.length > 0 && selectedAlmacen) {
            fetchInventario();
        }
    }, [selectedAlmacen, productosBase]);

    return (
        <View style={styles.container}>
            {/* Botón de menú hamburguesa */}
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>Lista de Insumos</Text>

            {/* Dropdown para seleccionar almacén */}
            <Dropdown
                data={almacenes}
                selectedValue={selectedAlmacen}
                onSelect={setSelectedAlmacen}
            />

            {/* Campo de búsqueda */}
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar producto..."
                value={search}
                onChangeText={setSearch}
            />

            {/* Lista de productos */}
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    key={`flatlist-${numColumns}`}
                    data={productos.filter((producto) =>
                        producto.nombre.toLowerCase().includes(search.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id_producto.toString()}
                    numColumns={numColumns}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <View style={[styles.card]}>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{item.nombre}</Text>
                                <Text style={styles.productDescription}>{item.marca}</Text>
                                <Text style={styles.productPrice}>Unidad: {item.unidad_medida}</Text>
                                <Text style={styles.productStock}>Stock: {item.stock}</Text>
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setProductoSeleccionado(item)}
                                >
                                    <Ionicons name="create-outline" size={24} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => setProductoAEliminar(item)}
                                >
                                    <Ionicons name="trash-outline" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Modal de edición */}
            {productoSeleccionado && (
                <EditarProducto
                    visible={!!productoSeleccionado}
                    producto={productoSeleccionado}
                    onClose={() => setProductoSeleccionado(null)}
                    onProductUpdated={() => {
                        fetchProductosBase();
                        fetchInventario();
                    }}
                />
            )}

            {/* Modal para Crear Producto */}
            <CrearProductos
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onProductAdded={() => {
                    fetchProductosBase();
                    fetchInventario();
                }}
            />

            {/* Botón flotante para agregar productos */}
            {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}

            {/* Modal de eliminación */}
            {productoAEliminar && (
                <EliminarProducto
                    visible={!!productoAEliminar}
                    producto={productoAEliminar}
                    onClose={() => setProductoAEliminar(null)}
                    onProductDeleted={() => {
                        fetchProductosBase();
                        fetchInventario();
                    }}
                />
            )}
        </View>
    );
};

export default Productos;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    menuButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10, // Asegura que esté por encima de otros elementos
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchInput: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    productName: {
        width: '100%',
        fontSize: 18,
        fontWeight: 'bold',
    },
    productDescription: {
        fontSize: 14,
        color: 'gray',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
        marginTop: 5,
    },
    productStock: {
        fontSize: 14,
        color: '#28a745',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007bff',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    fabText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginRight: 5,
    },
    productInfo: {
        flex: 1
    },
    deleteButton: {
        backgroundColor: '#DC3545',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});