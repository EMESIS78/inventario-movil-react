import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { AuthContext } from '@/src/AuthContext';
import axios from 'axios';
import { API_URL } from '../../src/config/env';
import { Ionicons } from '@expo/vector-icons';

interface Almacen {
    id: number;
    nombre: string;
    ubicacion: string;
}

const Almacenes = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation<DrawerNavProp>();
    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);

    const fetchAlmacenes = useCallback(async () => {
        if (!auth) return;

        try {
            const response = await axios.get(`${API_URL}/almacenes`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setAlmacenes(response.data);
        } catch (error) {
            console.error('❌ Error al obtener almacenes:', error);
        }
    }, [auth]);

    useFocusEffect(
        useCallback(() => {
            if (auth) fetchAlmacenes();
        }, [auth, fetchAlmacenes])
    );

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }


    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Almacenes</Text>
                <View style={{ width: 28 }} /> {/* Espacio para balancear el ícono del menú */}
            </View>

            {/* Lista de almacenes */}
            <FlatList
                data={almacenes}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity activeOpacity={0.8}>
                        <View style={styles.card}>
                            <Ionicons name="business-outline" size={28} color="#2563eb" style={{ marginBottom: 8 }} />
                            <Text style={styles.cardTitle}>{item.nombre}</Text>
                            <Text style={styles.cardText}>{item.ubicacion}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default Almacenes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        paddingTop: Platform.OS === 'android' ? 0 : 0,
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
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    cardText: {
        fontSize: 14,
        color: '#6b7280',
    },
});