import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
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
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const [salidas, setSalidas] = useState<Salida[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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

    // Filtrar las salidas según la búsqueda
    const filteredSalidas = salidas.filter((salida) =>
        salida.almacen.toLowerCase().includes(search.toLowerCase()) ||
        salida.motivo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Salidas</Text>

            {/* Barra de Búsqueda */}
            <TextInput
                style={styles.searchBar}
                placeholder="Buscar por motivo o almacén"
                placeholderTextColor="#888"
                value={search}
                onChangeText={setSearch}
            />

            {/* Botones */}
            <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
                <TouchableOpacity style={styles.greenButton} onPress={() => navigation.navigate('NuevaSalida')}>
                    <Text style={styles.buttonText}>Nueva Salida</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.redButton}>
                    <Text style={styles.buttonText}>Descargar PDF</Text>
                </TouchableOpacity>
            </View>

            {filteredSalidas.length === 0 ? (
                <Text style={styles.noDataText}>No hay salidas registradas.</Text>
            ) : isLandscape ? (
                // Vista Horizontal - Tabla
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>#</Text>
                        <Text style={styles.tableHeaderText}>Almacén</Text>
                        <Text style={styles.tableHeaderText}>Motivo</Text>
                        <Text style={styles.tableHeaderText}>Usuario</Text>
                        <Text style={styles.tableHeaderText}>Fecha</Text>
                        <Text style={styles.tableHeaderText}>Acciones</Text>
                    </View>
                    <FlatList
                        data={filteredSalidas}
                        keyExtractor={(item) => item.id_salida.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>{index + 1}</Text>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">{item.almacen}</Text>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">{item.motivo}</Text>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">{item.usuario}</Text>
                                <Text style={styles.tableCell} >{new Date(item.created_at).toLocaleDateString()}</Text>
                                <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('DetallesSalida', { id: item.id_salida })}>
                                    <Text style={styles.buttonText}>Ver Detalles</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            ) : (
                // Vista Vertical - Tarjetas
                <FlatList
                    data={filteredSalidas}
                    keyExtractor={(item) => item.id_salida.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Motivo: {item.motivo}</Text>
                            <Text style={styles.cardText}>Almacén: {item.almacen}</Text>
                            <Text style={styles.cardText}>Usuario: {item.usuario}</Text>
                            <Text style={styles.cardDate}>Fecha: {new Date(item.created_at).toLocaleString()}</Text>
                            <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('DetallesSalida', { id: item.id_salida })}>
                                <Text style={styles.buttonText}>Ver Detalles</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Botón Flotante */}
            <View style={styles.floatingButtonsContainer} >
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
        </View >
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
    searchBar: {
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    buttonContainerLandscape: {
        justifyContent: 'center', // Centra los botones en horizontal
    },
    greenButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    redButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    blueButton: {
        backgroundColor: '#007bff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    tableContainer: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        padding: 10,
        borderRadius: 5,
    },
    tableHeaderText: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableCell: {
        flex: 1,
        textAlign: 'justify',
        padding: 10,
        fontSize: 14,
    },
});

export default Salidas;