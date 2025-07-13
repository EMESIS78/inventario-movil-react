import { API_URL } from '@env';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { AuthContext } from '../../../src/AuthContext';

import CrearProductos from '../../actions/CrearProducto';
import EditarProducto from '../../actions/EditarProductos';
import EliminarProducto from '../../actions/EliminarProducto';
import ProductoList from './ProductoList';
import ProductosDropdown from './ProductosDropdown';
import ProductosHeader from './ProductosHeader';
import ProductosSearchBar from './ProductosSearchBar';
import FabButton from './FabButton';

const Productos = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [almacenes, setAlmacenes] = useState([]);
    const [selectedAlmacen, setSelectedAlmacen] = useState(null);
    const [productosBase, setProductosBase] = useState([]);
    const [productos, setProductos] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAlmacenes = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/almacenes`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setAlmacenes(res.data);
            if (res.data.length > 0) setSelectedAlmacen(res.data[0]);
        } catch (err) {
            console.error('Error cargando almacenes', err);
        }
    }, [auth]);

    const fetchProductosBase = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/productos`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            const cleanData = res.data.map(({ created_at, updated_at, ...rest }) => rest);
            setProductosBase(cleanData);
        } catch (err) {
            console.error('Error cargando productos base', err);
        }
    }, [auth]);

    const fetchInventario = useCallback(async () => {
        const idAlmacen = auth.user?.rol === 'admin'
            ? selectedAlmacen?.id
            : auth.user?.almacen_id;

        if (!idAlmacen || productosBase.length === 0) return;

        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/inventario?id_almacen=${idAlmacen}`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            const inventario = res.data;
            const productosConStock = productosBase.map(p => {
                const stockItem = inventario.find(i => i.id_producto === p.id_producto);
                return { ...p, stock: stockItem ? stockItem.stock : 0 };
            });
            setProductos(productosConStock);
        } catch (err) {
            console.error('Error cargando inventario', err);
        } finally {
            setLoading(false);
        }
    }, [auth, selectedAlmacen, productosBase]);

    useFocusEffect(
        useCallback(() => {
            fetchAlmacenes();
            fetchProductosBase();
        }, [fetchAlmacenes, fetchProductosBase])
    );

    useEffect(() => {
        if (!auth || auth.loading) return;
        fetchInventario();
    }, [auth, selectedAlmacen, productosBase]);

    if (!auth) return <Text>No hay sesión activa</Text>;

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
            <ProductosHeader onOpenMenu={() => navigation.openDrawer()} />

            {auth.user?.rol === 'admin' && (
                <ProductosDropdown
                    almacenes={almacenes}
                    selected={selectedAlmacen}
                    onSelect={setSelectedAlmacen}
                />
            )}

            <ProductosSearchBar value={search} onChange={setSearch} />

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <ProductoList
                    productos={productos}
                    search={search}
                    onEdit={setProductoSeleccionado}
                    onDelete={setProductoAEliminar}
                />
            )}

            <CrearProductos
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onProductAdded={() => {
                    fetchProductosBase();
                    fetchInventario();
                }}
            />

            {productoSeleccionado && (
                <EditarProducto
                    visible={!!productoSeleccionado}
                    producto={productoSeleccionado}
                    onClose={() => setProductoSeleccionado(null)}
                    onProductUpdated={() => {
                        fetchProductosBase();
                        fetchInventario();
                    }}
                />
            )}

            {productoAEliminar && (
                <EliminarProducto
                    visible={!!productoAEliminar}
                    producto={productoAEliminar}
                    onClose={() => setProductoAEliminar(null)}
                    onProductDeleted={() => {
                        fetchProductosBase();
                        fetchInventario();
                    }}
                />
            )}

            {(auth.user?.rol === 'admin' || auth.user?.rol === 'supervisor') && (
                <FabButton onPress={() => setModalVisible(true)} />
            )}
        </View>
    );
};

export default Productos;
