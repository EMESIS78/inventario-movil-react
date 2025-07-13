import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../../src/AuthContext';

import AlmacenesHeader from './AlmacenesHeader';
import AlmacenCard from './AlmacenCard';

const Almacenes = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation();
    const [almacenes, setAlmacenes] = useState([]);

    const fetchAlmacenes = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/almacenes`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setAlmacenes(res.data);
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
        <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <AlmacenesHeader onMenu={() => navigation.openDrawer()} />
            <FlatList
                data={almacenes}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => <AlmacenCard nombre={item.nombre} ubicacion={item.ubicacion} />}
            />
        </View>
    );
};

export default Almacenes;
