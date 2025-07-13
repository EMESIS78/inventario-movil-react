import React, { useState, useEffect, useContext } from 'react';
import {
  View, FlatList, ActivityIndicator, Modal, StatusBar, Text
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env';
import { AuthContext } from '../../../src/AuthContext';

import ReportesHeader from './ReportesHeader';
import ReportesSwitchButton from './ReportesSwitchButton';
import ReporteCard from './ReporteCard';
import MovimientosProductos from '../../actions/MovimientosProductos';

const Reportes = () => {
  const auth = useContext(AuthContext);
  const navigation = useNavigation();
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarGlobal, setMostrarGlobal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [almacenes, setAlmacenes] = useState([]);

  useEffect(() => {
    obtenerDatos();
  }, [mostrarGlobal]);

  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const endpoint = mostrarGlobal
        ? `${API_URL}/reporte-global`
        : `${API_URL}/informe-inventario`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${auth?.token ?? ''}` }
      });

      const contenido = mostrarGlobal ? response.data.reporte : response.data.informe;
      setDatos(contenido);
    } catch (error) {
      console.error('❌ Error al obtener datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlmacenes = async () => {
    try {
      const response = await axios.get(`${API_URL}/almacenes`, {
        headers: { Authorization: `Bearer ${auth?.token ?? ''}` },
      });

      const raw = response.data?.data ?? response.data;
      const data = raw.map(a => ({ label: a.nombre, value: a.id }));
      setAlmacenes(data);
    } catch (error) {
      console.error('❌ Error al cargar almacenes:', error);
    }
  };

  useEffect(() => {
    fetchAlmacenes();
  }, [auth?.token]);

  const ajustarStock = async (producto) => {
    try {
      let idAlmacen = producto.id_almacen;

      if (!idAlmacen) {
        const encontrado = almacenes.find(a => a.label === producto.nombre_almacen);
        idAlmacen = encontrado?.value;
        if (!idAlmacen) {
          alert('⚠️ Producto sin almacén asociado.');
          return;
        }
      }

      await axios.put(`${API_URL}/actualizar-stock`, {
        p_id_almacen: idAlmacen,
        p_id_articulo: producto.id_producto,
        p_nuevo_stock: parseInt(nuevoStock),
        p_user_id: auth?.user?.id
      }, {
        headers: { Authorization: `Bearer ${auth?.token ?? ''}` }
      });

      obtenerDatos();
      setEditingItem(null);
      setNuevoStock('');
      alert('✅ Stock actualizado.');
    } catch (error) {
      console.error('Error al actualizar stock:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ReportesHeader onMenu={() => navigation.openDrawer()} />
      <ReportesSwitchButton
        mostrarGlobal={mostrarGlobal}
        onToggle={() => setMostrarGlobal(!mostrarGlobal)}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={datos}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <ReporteCard
              producto={item}
              global={mostrarGlobal}
              editingItem={editingItem}
              nuevoStock={nuevoStock}
              onChangeStock={setNuevoStock}
              onEdit={() => setEditingItem(item.id_producto)}
              onCancelEdit={() => { setEditingItem(null); setNuevoStock(''); }}
              onSaveEdit={() => ajustarStock(item)}
              onVerMovimientos={() => setProductoSeleccionado(item.id_producto)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {productoSeleccionado && (
        <Modal visible animationType="slide">
          <MovimientosProductos
            idProducto={productoSeleccionado}
            onClose={() => setProductoSeleccionado(null)}
          />
        </Modal>
      )}
    </View>
  );
};

export default Reportes;
