import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';

interface Salida {
    id_salida: number;
    usuario: string;
    almacen: string;
    motivo: string;
    created_at: string;
}

const Salidas = ({ navigation }: any) => {
    const auth = useContext(AuthContext);
    const [salidas, setSalidas] = useState<Salida[]>([]);
    const [loading, setLoading] = useState(true);

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    const fetchSalidas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/salidas`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            console.log('✅ Datos obtenidos:', response.data); // Depuración

            if (response.data.success) {
                setSalidas(response.data.data); // Asigna solo el array
            } else {
                console.error('❌ Error en la respuesta del servidor:', response.data.message);
            }
        } catch (error) {
            console.error('❌ Error al obtener salidas:', error);
        } finally {
            setLoading(false);
        }
    }, [auth.token]);

    useFocusEffect(
        useCallback(() => {
            fetchSalidas();
        }, [fetchSalidas])
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Salidas</Text>

            {salidas.length === 0 ? (
                <Text style={styles.noDataText}>No hay salidas registradas.</Text>
            ) : (
                <FlatList
                    data={salidas}
                    keyExtractor={(item) => item.id_salida.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.usuario}</Text>
                            <Text style={styles.cardText}>Almacén: {item.almacen}</Text>
                            <Text style={styles.cardText}>Motivo: {item.motivo}</Text>
                            <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}

            {/* Botón Flotante */}
            <View style={styles.floatingButtonsContainer}>
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Inventario')}>
                    <Text style={styles.buttonText}>Inventario</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Entradas')}>
                    <Text style={styles.buttonText}>Entradas</Text>
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
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    card: {
        padding: 16,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 16,
        color: 'gray',
    },
    cardDate: {
        fontSize: 14,
        color: 'darkgray',
        marginTop: 5,
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

export default Salidas;