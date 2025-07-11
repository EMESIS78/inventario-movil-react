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

    const fetchSalidas = useCallback(async () => {
        if (!auth) return;

        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/salidas`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });

            if (data.success) setSalidas(data.data);
            else console.error('❌ Error del servidor:', data.message);
        } catch (error) {
            console.error('❌ Error al obtener salidas:', error);
        } finally {
            setLoading(false);
        }
    }, [auth]);

    const descargarPDF = useCallback(async () => {
        if (!auth) return;

        try {
            const pdfUrl = `${API_URL}/reporte-salidas`;
            const fileUri = FileSystem.documentDirectory + 'reporte_salidas.pdf';

            const downloadResumable = FileSystem.createDownloadResumable(
                pdfUrl,
                fileUri,
                { headers: { Authorization: `Bearer ${auth.token}` } }
            );

            const result = await downloadResumable.downloadAsync();
            if (result?.uri) await Sharing.shareAsync(result.uri);
            else console.warn('⚠️ Descarga incompleta.');
        } catch (error) {
            console.error('❌ Error al descargar PDF:', error);
        }
    }, [auth]);

    useFocusEffect(
        useCallback(() => {
            if (auth) fetchSalidas();
        }, [auth, fetchSalidas])
    );

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const filteredSalidas = salidas.filter(s =>
        s.almacen.toLowerCase().includes(search.toLowerCase()) ||
        s.motivo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={28} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Salidas de Insumos</Text>
                <View style={{ width: 28 }} />
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
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Nueva Salida</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.redButton} onPress={descargarPDF}>
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Descargar PDF</Text>
                </TouchableOpacity>
            </View>

            {filteredSalidas.length === 0 ? (
                <Text style={styles.noDataText}>No hay salidas registradas.</Text>
            ) : (

                <FlatList
                    data={filteredSalidas}
                    keyExtractor={(item) => item.id_salida.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>📝 Motivo: {item.motivo}</Text>
                            <Text style={styles.cardText}>🏪 Almacén: {item.almacen}</Text>
                            <Text style={styles.cardText}>👤 Usuario: {item.usuario}</Text>
                            <Text style={styles.cardDate}>📅 Fecha: {new Date(item.created_at).toLocaleString()}</Text>
                            <TouchableOpacity
                                style={styles.blueButton}
                                onPress={() => setDetalleDocumento(item.id_salida.toString())}
                            >
                                <Ionicons name="eye-outline" size={20} color="#fff" />
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    cardText: {
        fontSize: 14,
        color: '#4b5563',
    },
    cardDate: {
        fontSize: 13,
        color: '#9ca3af',
        marginVertical: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22c55e',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        elevation: 2,
        marginRight: 6,
    },
    redButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        elevation: 2,
    },
    blueButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 10,
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
});

export default Salidas;