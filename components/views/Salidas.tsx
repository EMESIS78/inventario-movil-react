import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';
import CrearSalida from '../actions/CrearSalida';
import SalidaDetalle from '../extras/SalidaDetalle';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
    const [modalVisible, setModalVisible] = useState(false);
    const [detalleDocumento, setDetalleDocumento] = useState<string | null>(null);

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

    const descargarPDF = async () => {
        try {
            const pdfUrl = `${API_URL}/reporte-salidas`;
            const fileUri = FileSystem.documentDirectory + 'reporte_salidas.pdf';

            const downloadResumable = FileSystem.createDownloadResumable(
                pdfUrl,
                fileUri,
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );
            const result = await downloadResumable.downloadAsync();

            if (result && result.uri) {
                console.log('📄 PDF descargado en:', result.uri);
                await Sharing.shareAsync(result.uri);
            } else {
                console.warn('⚠️ La descarga no se completó correctamente.');
            }
        } catch (error) {
            console.error('❌ Error al descargar PDF:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Salidas</Text>
            </View>

            <TextInput
                style={styles.searchBar}
                placeholder="Buscar por motivo o almacén"
                placeholderTextColor="#888"
                value={search}
                onChangeText={setSearch}
            />

            <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
                <TouchableOpacity style={styles.greenButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>Nueva Salida</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.redButton} onPress={descargarPDF}>
                    <Text style={styles.buttonText}>Descargar PDF</Text>
                </TouchableOpacity>
            </View>

            {filteredSalidas.length === 0 ? (
                <Text style={styles.noDataText}>No hay salidas registradas.</Text>
            ) : isLandscape ? (
                // Vista Horizontal - Tabla
                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>#</Text>
                            <Text style={styles.tableHeaderText}>Almacén</Text>
                            <Text style={styles.tableHeaderText}>Motivo</Text>
                            <Text style={styles.tableHeaderText}>Usuario</Text>
                            <Text style={styles.tableHeaderText}>Fecha</Text>
                            <Text style={styles.tableHeaderText}>Acciones</Text>
                        </View>
                        {filteredSalidas.map((item) => (
                            <View key={item.id_salida} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{item.id_salida}</Text>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
                                    {item.motivo}
                                </Text>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
                                    {item.almacen}
                                </Text>
                                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
                                    {item.usuario}
                                </Text>
                                <Text style={styles.tableCell}>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                                <TouchableOpacity
                                    style={styles.blueButton}
                                    onPress={() => setDetalleDocumento(item.id_salida.toString())}
                                >
                                    <Text style={styles.buttonText}>Ver Detalles</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            ) : (

                <FlatList
                    data={filteredSalidas}
                    keyExtractor={(item) => item.id_salida.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Motivo: {item.motivo}</Text>
                            <Text style={styles.cardText}>Almacén: {item.almacen}</Text>
                            <Text style={styles.cardText}>Usuario: {item.usuario}</Text>
                            <Text style={styles.cardDate}>Fecha: {new Date(item.created_at).toLocaleString()}</Text>
                            <TouchableOpacity
                                style={styles.blueButton}
                                onPress={() => setDetalleDocumento(item.id_salida.toString())}
                            >
                                <Text style={styles.buttonText}>Ver Detalles</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
            <CrearSalida
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={fetchSalidas}
            />
            {detalleDocumento && (
                <SalidaDetalle
                    visible={!!detalleDocumento}
                    onClose={() => setDetalleDocumento(null)}
                    id_salida={detalleDocumento}
                />
            )}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 10,
        marginVertical: 6,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    cardDate: {
        fontSize: 13,
        color: '#999',
        marginTop: 6,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchBar: {
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
        marginHorizontal: 10,
    },
    buttonContainerLandscape: {
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    greenButton: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        elevation: 2,
    },
    redButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        elevation: 2,
    },
    blueButton: {
        backgroundColor: '#007bff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    tableContainer: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#4287f5',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 6,
        marginBottom: 4,
        marginHorizontal: 4,
    },
    tableHeaderText: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
        color: '#fff',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 4,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        borderRadius: 6,
    },
    tableCell: {
        flex: 1,
        fontSize: 13,
        textAlign: 'center',
        color: '#444',
    },
    menuButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10, // Asegura que esté por encima de otros elementos
    },
});

export default Salidas;