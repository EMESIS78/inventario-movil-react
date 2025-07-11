import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, StatusBar, Modal, TextInput
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '@env';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../src/AuthContext';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { Ionicons } from '@expo/vector-icons';
import MovimientosProductos from '../actions/MovimientosProductos';

interface Producto {
  id_producto: number;
  nombre: string;
  marca?: string;
  ubicacion?: string;
  stock?: number;
  nombre_almacen?: string;
  id_almacen?: number;
  existencia?: number;
}

const Reportes: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigation = useNavigation<DrawerNavProp>();

  const [datos, setDatos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarGlobal, setMostrarGlobal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [almacenes, setAlmacenes] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    obtenerDatos();
  }, [mostrarGlobal]);

  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const endpoint = mostrarGlobal
        ? `${API_URL}/reporte-global`
        : `${API_URL}/informe-inventario`;

      if (!auth || !auth.token) throw new Error('Usuario no autenticado');

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${auth?.token ?? ''}` }
      });

      setDatos(mostrarGlobal ? response.data.reporte : response.data.informe);
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

      const almacenesRaw = response.data?.data ?? response.data;

      if (!Array.isArray(almacenesRaw)) {
        console.warn('⚠️ La respuesta no es un array:', almacenesRaw);
        return;
      }

      const data = almacenesRaw.map((alm: any) => ({
        label: alm.nombre,
        value: alm.id,
      }));

      setAlmacenes(data);
    } catch (error) {
      console.error('❌ Error al cargar almacenes:', error);
    }
  };

  useEffect(() => {
    fetchAlmacenes();
  }, [auth?.token]);

  const ajustarStock = async (item: Producto) => {
    try {
      let idAlmacen = item.id_almacen;

      if (!idAlmacen) {
        const almacenEncontrado = almacenes.find(
          (a) => a.label === item.nombre_almacen
        );
        idAlmacen = almacenEncontrado?.value;

        if (!idAlmacen) {
          alert('⚠️ Este producto no tiene un almacén asociado.');
          return;
        }
      }

      console.log({
        p_id_almacen: idAlmacen,
        p_id_articulo: item.id_producto,
        p_nuevo_stock: nuevoStock,
        p_user_id: auth?.user?.id
      });

      await axios.put(`${API_URL}/actualizar-stock`, {
        p_id_almacen: idAlmacen,
        p_id_articulo: item.id_producto,
        p_nuevo_stock: parseInt(nuevoStock),
        p_user_id: auth?.user?.id
      }, {
        headers: { Authorization: `Bearer ${auth?.token ?? ''}` }
      });

      obtenerDatos();
      setEditingItem(null);
      setNuevoStock('');
      alert('Stock actualizado correctamente.');
    } catch (error) {
      console.error('Error al actualizar stock:', error);
    }
  };


  const renderItem = ({ item }: { item: Producto }) => (
    <TouchableOpacity onPress={() => setProductoSeleccionado(item.id_producto)}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cube-outline" size={22} color="#2563eb" />
          <Text style={styles.cardTitle}>{item.nombre}</Text>
        </View>

        {mostrarGlobal ? (
          <>
            <View style={styles.cardRow}>
              <Text style={styles.label}>ID Producto:</Text>
              <Text style={styles.value}>{item.id_producto}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Existencia Total:</Text>
              <Text style={styles.value}>{item.existencia}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Marca:</Text>
              <Text style={styles.value}>{item.marca}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Ubicación:</Text>
              <Text style={styles.value}>{item.ubicacion}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Stock:</Text>
              {editingItem === item.id_producto ? (
                <>
                  <TextInput
                    value={nuevoStock}
                    onChangeText={setNuevoStock}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="Nuevo stock"
                  />
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => ajustarStock(item)}
                      style={styles.saveButton}
                    >
                      <Text style={styles.buttonText}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingItem(null);
                        setNuevoStock('');
                      }}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.value}>{item.stock}</Text>
                  <TouchableOpacity
                    onPress={() => setEditingItem(item.id_producto)}
                    style={styles.editButton}
                  >
                    <Text style={styles.buttonText}>Ajustar Stock</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Almacén:</Text>
              <Text style={styles.value}>{item.nombre_almacen}</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportes</Text>
        <View style={{ width: 28 }} />
      </View>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setMostrarGlobal(!mostrarGlobal)}
      >
        <Text style={styles.switchButtonText}>
          {mostrarGlobal ? 'Ver Informe de Inventario' : 'Ver Informe Global'}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#1f2937" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={datos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {productoSeleccionado && (
        <Modal
          visible={!!productoSeleccionado}
          animationType="slide"
          onRequestClose={() => setProductoSeleccionado(null)}
        >
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
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  producto: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  detalle: {
    fontSize: 14,
    color: '#374151',
  },
  switchButton: {
    backgroundColor: '#2563eb',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 8,
    width: 100,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    padding: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
})