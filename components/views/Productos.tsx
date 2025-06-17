import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { AuthContext } from '../../src/AuthContext';
import axios from 'axios';
import { API_URL } from '../../src/config/env';
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

    const fetchAlmacenes = useCallback(async () => {
        if (!auth) return;

        try {
            const response = await axios.get(`${API_URL}/almacenes`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setAlmacenes(response.data);
            if (response.data.length > 0) setSelectedAlmacen(response.data[0]);
        } catch (error) {
            console.error('❌ Error al obtener almacenes:', error);
        }
    }, [auth]);

    const fetchProductosBase = useCallback(async () => {
        if (!auth) return;

        try {
            const response = await axios.get(`${API_URL}/productos`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const productosLimpios = response.data.map(({ created_at, updated_at, ...resto }: any) => resto);
            setProductosBase(productosLimpios);
            console.log('✅ Productos base cargados');
        } catch (error) {
            console.error('❌ Error al obtener productos base:', error);
        }
    }, [auth]);

    const fetchInventario = useCallback(async () => {
        if (!auth) return;

        const idAlmacen = auth.user?.rol === 'admin'
            ? selectedAlmacen?.id
            : auth.user?.almacen_id;

        if (!idAlmacen || productosBase.length === 0) return;

        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/inventario?id_almacen=${idAlmacen}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            const inventario = response.data;

            const productosConStock = inventario.map((item: any) => {
                const productoBase = productosBase.find(p => p.id_producto === item.id_producto);
                return productoBase ? { ...productoBase, stock: item.stock } : null;
            }).filter(Boolean) as Producto[];

            setProductos(productosConStock);
            console.log('✅ Inventario cargado');
        } catch (error) {
            console.error('❌ Error al obtener inventario:', error);
        } finally {
            setLoading(false);
        }
    }, [auth, selectedAlmacen, productosBase]);

    useFocusEffect(
        useCallback(() => {
            fetchAlmacenes();
            fetchProductosBase();
        }, [fetchAlmacenes, fetchProductosBase])
    );

    useEffect(() => {
        if (!auth || auth.loading) return;

        const idAlmacen = auth.user?.rol === 'admin'
            ? selectedAlmacen?.id
            : auth.user?.almacen_id;

        if (!idAlmacen || productosBase.length === 0) {
            setLoading(false);
            return;
        }

        fetchInventario();
    }, [auth, selectedAlmacen, productosBase]);

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    return (
        <View style={styles.container}>
            {/* Botón de menú hamburguesa */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={28} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.title}>Lista de Insumos</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Dropdown para seleccionar almacén */}
            {auth.user?.rol === 'admin' && (
                <Dropdown
                    data={almacenes}
                    selectedValue={selectedAlmacen}
                    onSelect={setSelectedAlmacen}
                />
            )}

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
                            <View style={styles.cardContent}>
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
            {(auth.user?.rol === 'admin' || auth.user?.rol === 'supervisor') && (
                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={28} color="#fff" />
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    searchInput: {
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        fontSize: 15,
        color: '#111827',
    },
    loader: {
        marginTop: 40,
    },
    flatListContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginVertical: 6,
        padding: 16,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    cardContent: {
        gap: 4,
    },
    productName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2,
    },
    productDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 14,
        color: '#007bff',
    },
    productStock: {
        fontSize: 14,
        color: '#16a34a',
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
    },
    editButton: {
        backgroundColor: '#3b82f6',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#3b82f6',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
    },
});