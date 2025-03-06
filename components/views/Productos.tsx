import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../../src/AuthContext';
import axios from 'axios';
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import CrearProductos from '../actions/CrearProducto';

interface Producto {
    id_producto: number;
    codigo: string;
    nombre: string;
    marca: string;
    unidad_medida: string;
    ubicacion: string;
    imagen: string;
}

const Productos = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation<DrawerNavProp>(); // Agregamos el hook para manejar la navegación
    const [modalVisible, setModalVisible] = useState(false);

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    const { user } = auth;
    const [productos, setProductos] = useState<Producto[]>([]);
    const [search, setSearch] = useState('');

    const fetchProductos = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/productos`);
            const productosLimpios = response.data.map((producto: { created_at: string; updated_at: string; [key: string]: any }) => {
                const { created_at, updated_at, ...resto } = producto;
                return resto;
            });
            setProductos(productosLimpios);
            console.log('✅ Productos actualizados');
        } catch (error) {
            console.error('❌ Error al obtener productos:', error);
        }
    }, []);

    // Se ejecuta cuando se entra a la pantalla
    useFocusEffect(
        useCallback(() => {
            fetchProductos();
        }, [fetchProductos])
    );

    // Filtrar productos cuando cambia la búsqueda
    useEffect(() => {
        fetchProductos();
    }, [search]);

    return (
        <View style={styles.container}>
            {/* Botón de menú hamburguesa */}
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>Productos</Text>

            {/* Campo de búsqueda */}
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar producto..."
                value={search}
                onChangeText={setSearch}
            />

            {/* Lista de productos */}
            <FlatList
                data={productos.filter((producto) =>
                    producto.nombre.toLowerCase().includes(search.toLowerCase())
                )}
                keyExtractor={(item) => item.id_producto.toString()}
                renderItem={({ item }) => {
                    return (
                        <View style={styles.card}>
                            <Image
                                source={{ uri: `http://192.168.0.86:3000/uploads/${item.imagen}`}}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                            <Text style={styles.productName}>{item.nombre}</Text>
                            <Text style={styles.productDescription}>{item.marca}</Text>
                            <Text style={styles.productPrice}>Unidad: {item.unidad_medida}</Text>
                        </View>
                    );
                }}
            />

            {/* Modal para Crear Producto */}
            <CrearProductos visible={modalVisible} onClose={() => setModalVisible(false)} onProductAdded={fetchProductos} />

            {/* Botón flotante para agregar productos */}
            {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Productos;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 16,
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
    productImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
});