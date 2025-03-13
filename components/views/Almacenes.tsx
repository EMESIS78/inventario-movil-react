import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { AuthContext } from '../../src/AuthContext';
import axios from 'axios';
import { API_URL } from '@env';
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

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    const fetchAlmacenes = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/almacenes`);
            setAlmacenes(response.data);
            console.log('✅ Almacenes actualizados');
        } catch (error) {
            console.error('❌ Error al obtener almacenes:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAlmacenes();
        }, [fetchAlmacenes])
    );

    return (
        <View style={styles.container}>
            {/* Botón de menú hamburguesa */}
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>Almacenes</Text>

            {/* Lista de almacenes */}
            <FlatList
                data={almacenes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{item.nombre}</Text>
                        <Text style={styles.cardText}>{item.ubicacion}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    menuButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 14,
        color: '#555',
    },
});

export default Almacenes;