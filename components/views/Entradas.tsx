import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';
import CrearEntrada from '../actions/CrearEntrada';

interface Entrada {
  id_entrada: number;
  usuario: string;
  almacen: string;
  documento: string;
  created_at: string;
}

const Entradas = ({ navigation }: any) => {
  const auth = useContext(AuthContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height; // Ahora detecta la orientación correctamente
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  if (!auth) {
    return <Text>Por favor inicia sesión</Text>;
  }

  const fetchEntradas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/entradas`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      console.log('✅ Datos obtenidos:', response.data);

      if (response.data.success) {
        setEntradas(response.data.data);
      } else {
        console.error('❌ Error al obtener datos:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching entradas:', error);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useFocusEffect(
    useCallback(() => {
      fetchEntradas();
    }, [fetchEntradas])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Filtrar entradas por búsqueda
  const filteredEntradas = entradas.filter((entrada) =>
    entrada.documento.toLowerCase().includes(search.toLowerCase()) ||
    entrada.almacen.toLowerCase().includes(search.toLowerCase()) ||
    entrada.usuario.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
      <Text style={styles.title}>Entradas</Text>

      {/* Barra de búsqueda */}
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por documento, almacen o usuario"
        value={search}
        onChangeText={setSearch}
      />

      {/*Botones*/}
      <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
      <TouchableOpacity style={styles.greenButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Nueva Entrada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.redButton}>
          <Text style={styles.buttonText}>Descargar PDF</Text>
        </TouchableOpacity>
      </View>

      {filteredEntradas.length === 0 ? (
        <Text style={styles.noDataText}>No se encontraron entradas</Text>
      ) : isLandscape ? (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>#</Text>
            <Text style={styles.tableHeaderText}>Documento</Text>
            <Text style={styles.tableHeaderText}>Almacen</Text>
            <Text style={styles.tableHeaderText}>Usuario</Text>
            <Text style={styles.tableHeaderText}>Fecha</Text>
            <Text style={styles.tableHeaderText}>Acciones</Text>
          </View>
          <FlatList
            data={filteredEntradas}
            keyExtractor={(item) => item.id_entrada.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.id_entrada}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.documento}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.almacen}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.usuario}</Text>
                <Text style={styles.tableCell}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('EntradaDetalles', { id: item.id_entrada })}>
                  <Text style={styles.buttonText}>Ver Detalles</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      ) : (
        <FlatList
          data={filteredEntradas}
          keyExtractor={(item) => item.id_entrada.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Documento: {item.documento}</Text>
              <Text style={styles.cardText}>Almacen: {item.almacen}</Text>
              <Text style={styles.cardText}>Usuario: {item.usuario}</Text>
              <Text style={styles.cardDate}>Fecha: {new Date(item.created_at).toLocaleString()}</Text>
              <TouchableOpacity style={styles.blueButton} onPress={() => navigation.navigate('EntradaDetalles', { id: item.id_entrada })}>
                <Text style={styles.buttonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/*Boton flotante */}
      <View style={styles.floatingButtonsContainer} >
        <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Salidas')}>
          <Text style={styles.buttonText}>Salidas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Traslados')}>
          <Text style={styles.buttonText}>Traslados</Text>
        </TouchableOpacity>
      </View>
      <CrearEntrada visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View >
  );
};

export default Entradas

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 16,
    color: 'gray',
  },
  cardDate: {
    fontSize: 14,
    color: 'darkgray',
    marginTop: 5,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
  },
  floatingButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  buttonContainerLandscape: {
    justifyContent: 'center', // Centra los botones en horizontal
  },
  greenButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  redButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  blueButton: {
    backgroundColor: '#007bff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tableContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    textAlign: 'justify',
    padding: 10,
    fontSize: 14,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10, // Asegura que esté por encima de otros elementos
},
});