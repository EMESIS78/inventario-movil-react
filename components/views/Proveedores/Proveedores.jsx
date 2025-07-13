import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../../src/AuthContext';

import ProveedoresHeader from './ProveedoresHeader';
import ProveedorCard from './ProveedorCard';

const Proveedores = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProveedores = useCallback(async () => {
        if (!auth) return;
        try {
            const res = await axios.get(`${API_URL}/proveedores`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            setProveedores(res.data);
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
            <ProveedoresHeader onMenu={() => navigation.openDrawer()} />
            {proveedores.length === 0 ? (
                <Text style={styles.noData}>No hay proveedores registrados.</Text>
            ) : (
                <FlatList
                    data={proveedores}
                    keyExtractor={(item) => item.id_ruc_proveedor.toString()}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <ProveedorCard nombre={item.nombres} ruc={item.id_ruc_proveedor} />
                    )}
                />
            )}
        </View>
    );
};

export default Proveedores;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
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
});
