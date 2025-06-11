import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Platform, TouchableOpacity, StatusBar
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';
import CrearUsuario from '../actions/CrearUsuario';
import EditarUsuario from '../actions/EditarUsuario';
import EliminarUsuario from '../actions/EliminarUsuario';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';

interface Usuario {
  id: number;
  name: string;
  email: string;
  rol: string;
}

const Usuarios = () => {
  const auth = useContext(AuthContext);
  const navigation = useNavigation<DrawerNavProp>();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuarios</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Lista de usuarios */}
      {usuarios.length === 0 ? (
        <Text style={styles.noData}>No hay usuarios registrados.</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle-outline" size={36} color="#2563eb" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.cardTitle}>{index + 1}. {item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.email}</Text>
                </View>
              </View>

              <Text style={styles.cardRole}>Rol: {item.rol}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => setUsuarioSeleccionado(item)}
                  style={styles.editButton}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setUsuarioAEliminar(item)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modales */}
      <EditarUsuario
        visible={!!usuarioSeleccionado}
        usuario={usuarioSeleccionado}
        onClose={() => setUsuarioSeleccionado(null)}
        onSuccess={fetchUsuarios}
      />
      <CrearUsuario
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchUsuarios}
      />
      <EliminarUsuario
        visible={!!usuarioAEliminar}
        usuario={usuarioAEliminar}
        onClose={() => setUsuarioAEliminar(null)}
        onSuccess={fetchUsuarios}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Usuarios;

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
    marginBottom: 12,
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
  cardRole: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
});