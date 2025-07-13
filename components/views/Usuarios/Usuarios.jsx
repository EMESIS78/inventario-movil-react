import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../../src/AuthContext';

import CrearUsuario from '../../actions/CrearUsuario';
import EditarUsuario from '../../actions/EditarUsuario';
import EliminarUsuario from '../../actions/EliminarUsuario';

import UsuariosHeader from './UsuariosHeader';
import UsuarioCard from './UsuarioCard';
import FabButton from './FabButton';

const Usuarios = () => {
  const auth = useContext(AuthContext);
  const navigation = useNavigation();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setUsuarios(res.data);
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <UsuariosHeader onMenu={() => navigation.openDrawer()} />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : usuarios.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#6b7280' }}>No hay usuarios registrados.</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item, index }) => (
            <UsuarioCard
              usuario={item}
              index={index}
              onEditar={() => setUsuarioSeleccionado(item)}
              onEliminar={() => setUsuarioAEliminar(item)}
            />
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
      <EliminarUsuario
        visible={!!usuarioAEliminar}
        usuario={usuarioAEliminar}
        onClose={() => setUsuarioAEliminar(null)}
        onSuccess={fetchUsuarios}
      />

      <FabButton onPress={() => setModalVisible(true)} />
    </View>
  );
};

export default Usuarios;
