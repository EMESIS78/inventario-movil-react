import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, useWindowDimensions, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../src/config/env';
import { AuthContext } from '../../src/AuthContext';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Proveedor {
    id_ruc_proveedor: number;
    nombres: string;
}

const Proveedores = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation<DrawerNavProp>();
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const { width, height } = useWindowDimensions();

    const fetchProveedores = useCallback(async () => {
        if (!auth) return;

        try {
            const response = await axios.get(`${API_URL}/proveedores`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            });

            setProveedores(response.data);
        } catch (error) {
            console.error('❌ Error al obtener proveedores:', error);
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Proveedores</Text>
                <View style={{ width: 28 }} /> {/* para centrar el título */}
            </View>

            {proveedores.length === 0 ? (
                <Text style={styles.noData}>No hay proveedores registrados.</Text>
            ) : (
                <FlatList
                    data={proveedores}
                    keyExtractor={(item) => item.id_ruc_proveedor.toString()}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="business-outline" size={32} color="#0ea5e9" />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.cardTitle}>{item.nombres}</Text>
                                    <Text style={styles.cardSubtitle}>RUC: {item.id_ruc_proveedor}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

export default Proveedores

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        elevation: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    noData: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#6b7280',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
})