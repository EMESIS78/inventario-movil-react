import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, useWindowDimensions, Animated, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../src/AuthContext';
import axios from 'axios';
import { API_URL } from '@env';
import Dropdown from '../customs/Dropdown'


interface Producto {
    id_producto: number;
    nombre: string;
    stock: number;
}

interface Almacen {
    id: number;
    nombre: string;
}

const Inventario = ({ navigation }: any) => {
    const { width, height } = useWindowDimensions(); // Detecta la orientación
    const isLandscape = width > height; // Si el ancho es mayor que el alto, es horizontal
    const auth = useContext(AuthContext);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [selectedAlmacen, setSelectedAlmacen] = useState<Almacen | null>(null);
    const [loading, setLoading] = useState(true);
    const [fabOpen, setFabOpen] = useState(false);
    const scaleAnim = useState(new Animated.Value(0))[0];

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    const fetchAlmacenes = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/almacenes`);
            setAlmacenes(response.data);
            if (response.data.length > 0) setSelectedAlmacen(response.data[0]); // Seleccionar el primero por defecto
        } catch (error) {
            console.error('❌ Error al obtener almacenes:', error);
        }
    }, []);

     // Obtener inventario del almacén seleccionado
    const fetchInventario = useCallback(async () => {
        if (!selectedAlmacen) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/inventario?id_almacen=${selectedAlmacen.id}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setProductos(response.data);
            console.log('✅ Inventario actualizado');
        } catch (error) {
            console.error('❌ Error al obtener el inventario:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedAlmacen, auth.token]);

    useFocusEffect(
        useCallback(() => {
            fetchAlmacenes();
        }, [fetchAlmacenes])
    );

    useFocusEffect(
        useCallback(() => {
            fetchInventario();
        }, [fetchInventario])
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={[styles.container, isLandscape && styles.containerLandscape]}>
            <Text style={styles.title}>Inventario</Text>

            {/* Dropdown personalizado */}
            <Dropdown 
                data={almacenes} 
                selectedValue={selectedAlmacen} 
                onSelect={setSelectedAlmacen} 
            />

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : productos.length === 0 ? (
                <Text style={styles.noProductsText}>No hay productos en este almacén.</Text>
            ) : (
                <FlatList
                    data={productos}
                    keyExtractor={(item) => item.id_producto.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.nombre}</Text>
                            <Text style={styles.cardStock}>Stock: {item.stock}</Text>
                        </View>
                    )}
                />
            )}

            {/* Botón Flotante */}
            <View style={styles.floatingButtonsContainer}>
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Entradas')}>
                    <Text style={styles.buttonText}>Entradas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Salidas')}>
                    <Text style={styles.buttonText}>Salidas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Traslados')}>
                    <Text style={styles.buttonText}>Traslados</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    containerLandscape: {
        flexDirection: 'row', // Ajusta los elementos en horizontal
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center',
    },
    loader: {
        marginTop: 20,
    },
    noProductsText: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginTop: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardStock: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    floatingButtonsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 20,
    },
    floatingButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Inventario;