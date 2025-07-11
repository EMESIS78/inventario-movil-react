import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';

const MovimientosProductos = ({ idProducto, onClose }) => {
    const auth = useContext(AuthContext);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    obtenerMovimientos();
}, [idProducto]);

    const obtenerMovimientos = async () => {
        try {
            const response = await axios.get(`${API_URL}/movimientos`, {
                params: { p_id_articulo: idProducto },
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setMovimientos(response.data.movimientos);
        } catch (error) {
            console.error('❌ Error al obtener movimientos:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Movimientos del Producto ID: {idProducto}</Text>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : movimientos.length === 0 ? (
                <Text>No hay movimientos registrados.</Text>
            ) : (
                <FlatList
                    data={movimientos}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.tipo}>{item.tipo}</Text>
                            <Text>ID Movimiento: {item.id_movimiento}</Text>
                            <Text>Almacén: {item.id_almacen ?? 'N/A'}</Text>
                            <Text>Cantidad: {item.cantidad}</Text>
                            <Text>Fecha: {new Date(item.created_at).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MovimientosProductos;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    card: { backgroundColor: '#f3f4f6', padding: 15, borderRadius: 8, marginBottom: 10 },
    tipo: { fontWeight: 'bold', color: '#2563eb' },
    closeButton: { backgroundColor: '#ef4444', padding: 12, borderRadius: 10, marginTop: 20 },
    closeButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
