import React, { useCallback, useContext, useState } from 'react';
import { View, ActivityIndicator, FlatList, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_URL } from '@env';
import axios from 'axios';
import { AuthContext } from '../../../src/AuthContext';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { useWindowDimensions } from 'react-native';
import CrearPlato from '../../actions/CrearPlato';
import EditarPlato from '../../actions/EditarPlato';
import EliminarPlato from '../../actions/EliminarPlato';

import PlatosHeader from './PlatosHeader';
import PlatosSearchBar from './PlatosSearchBar';
import PlatoCard from './PlatoCard';
import FabButton from './FabButton';

const Platos = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation();
    const [platos, setPlatos] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
    const [platoAEliminar, setPlatoAEliminar] = useState(null);
    const [platoExpandido, setPlatoExpandido] = useState(null);
    const { width, height } = useWindowDimensions();
    const numColumns = width > height ? 3 : 1;

    const fetchPlatos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/platos`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const platos = response.data.map(p => ({
                ...p,
                precio: isNaN(p.precio) ? 0 : p.precio
            }));
            setPlatos(platos);
        } catch (err) {
            console.error('Error al obtener platos:', err);
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useFocusEffect(useCallback(() => {
        fetchPlatos();
    }, [fetchPlatos]));

    if (!auth) return <Text>Error al cargar autenticación</Text>;

    const platosFiltrados = platos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
            <PlatosHeader onOpenMenu={() => navigation.openDrawer()} />
            <PlatosSearchBar value={search} onChange={setSearch} />

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={platosFiltrados}
                    keyExtractor={item => item.id_plato.toString()}
                    key={`flatlist-${numColumns}`}
                    numColumns={numColumns}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <PlatoCard
                            plato={item}
                            expandido={platoExpandido}
                            onExpand={setPlatoExpandido}
                            onEdit={() => setPlatoSeleccionado(item)}
                            onDelete={() => setPlatoAEliminar(item)}
                        />
                    )}
                />
            )}

            {auth.user?.rol !== 'usuario' && (
                <FabButton onPress={() => setModalVisible(true)} />
            )}

            <CrearPlato
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreated={fetchPlatos}
            />

            {platoSeleccionado && (
                <EditarPlato
                    visible
                    plato={platoSeleccionado}
                    onClose={() => setPlatoSeleccionado(null)}
                    onUpdated={fetchPlatos}
                />
            )}

            {platoAEliminar && (
                <EliminarPlato
                    visible
                    plato={platoAEliminar}
                    onClose={() => setPlatoAEliminar(null)}
                    onPlatoDeleted={fetchPlatos}
                />
            )}
        </View>
    );
};

export default Platos;
