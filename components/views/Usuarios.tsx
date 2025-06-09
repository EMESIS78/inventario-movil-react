import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, useWindowDimensions, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';
import CrearUsuario from '../actions/CrearUsuario';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import EditarUsuario from '../actions/EditarUsuario';
import EliminarUsuario from '../actions/EliminarUsuario';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
  const { width, height } = useWindowDimensions();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isLandscape = width > height;

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Usuarios Registrados</Text>
      </View>

      {usuarios.length === 0 ? (
        <Text style={styles.noData}>No hay usuarios registrados.</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{index + 1}. {item.name}</Text>
              <Text>Email: {item.email}</Text>
              <Text>Rol: {item.rol}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => setUsuarioSeleccionado(item)}
                  style={styles.editButton}
                >
                  <Ionicons name="create-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setUsuarioAEliminar(item)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

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
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <EliminarUsuario
        visible={!!usuarioAEliminar}
        usuario={usuarioAEliminar}
        onClose={() => setUsuarioAEliminar(null)}
        onSuccess={fetchUsuarios}
      />
    </View>
  );
};

export default Usuarios;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  table: {
    minWidth: 600,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    padding: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    padding: 8,
  },
  cell: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
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