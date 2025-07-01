import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, StatusBar
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '@env';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../src/AuthContext';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { Ionicons } from '@expo/vector-icons';

const Reportes = () => {
  const auth = useContext(AuthContext);
  const navigation = useNavigation<DrawerNavProp>();

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarGlobal, setMostrarGlobal] = useState(false); // false = inventario

  useEffect(() => {
    obtenerDatos();
  }, [mostrarGlobal]);

  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const endpoint = mostrarGlobal
        ? `${API_URL}/reporte-global`
        : `${API_URL}/informe-inventario`;

      if (!auth || !auth.token) {
        throw new Error('Usuario no autenticado');
      }
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

  setDatos(mostrarGlobal ? response.data.reporte : response.data.informe);
} catch (error) {
  console.error('❌ Error al obtener datos del informe:', error);
} finally {
  setLoading(false);
}
  };

const renderItem = ({ item }: any) => {
  return (
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
            <Text style={styles.value}>{item.stock}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.label}>Almacén:</Text>
            <Text style={styles.value}>{item.nombre_almacen}</Text>
          </View>
        </>
      )}
    </View>
  );
};

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
})