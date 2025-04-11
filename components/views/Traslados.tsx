import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';

interface Traslado {
  id_traslado: number;
  motivo: string;
  placa_vehiculo: string;
  guia: string;
  usuario: string;
  almacen_salida: string;
  almacen_entrada: string;
  created_at: string;
}

const Traslados = ({ navigation }: any) => {
  const auth = useContext(AuthContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height; // Ahora detecta la orientación correctamente
  const [traslados, setTraslados] = useState<Traslado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  if (!auth) {
    return <Text>Por favor inicia sesión</Text>;
  }

  const fetchTraslados = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/traslados`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      console.log('✅ Datos obtenidos:', response.data);

      if (response.data.success) {
        setTraslados(response.data.data);
      } else {
        console.error('❌ Error al obtener datos:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching traslados:', error);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useFocusEffect(
    useCallback(() => {
      fetchTraslados();
    }
      , [fetchTraslados]),
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const filteredTraslados = traslados.filter((traslado) =>
    traslado.motivo.toLowerCase().includes(search.toLowerCase()) ||
    traslado.almacen_salida.toLowerCase().includes(search.toLowerCase()) ||
    traslado.almacen_entrada.toLowerCase().includes(search.toLowerCase()) ||
    traslado.usuario.toLowerCase().includes(search.toLowerCase()) ||
    traslado.placa_vehiculo.toLowerCase().includes(search.toLowerCase()) ||
    traslado.guia.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
        <Ionicons name="menu" size={28} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Traslados</Text>

      {/* Barra de Búsqueda */}
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por motivo o almacén"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {/* Botones */}
      <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
        <TouchableOpacity style={styles.greenButton} onPress={() => navigation.navigate('NuevaSalida')}>
          <Text style={styles.buttonText}>Nueva Salida</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.redButton}>
          <Text style={styles.buttonText}>Descargar PDF</Text>
        </TouchableOpacity>
      </View>

      {filteredTraslados.length === 0 ? (
        <Text style={styles.noDataText}>No hay traslados disponibles</Text>
      ) : isLandscape ? (
        
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>#</Text>
            <Text style={styles.tableHeaderText}>Motivo</Text>
            <Text style={styles.tableHeaderText}>Almacen Salida</Text>
            <Text style={styles.tableHeaderText}>Almacen Entrada</Text>
            <Text style={styles.tableHeaderText}>Usuario</Text>
            <Text style={styles.tableHeaderText}>Placa</Text>
            <Text style={styles.tableHeaderText}>Guia</Text>
            <Text style={styles.tableHeaderText}>Fecha</Text>
            <Text style={styles.tableHeaderText}>Acciones</Text>
          </View>
          <FlatList
            data={filteredTraslados}
            keyExtractor={(item) => item.id_traslado.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.id_traslado}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.motivo}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.almacen_salida}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.almacen_entrada}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.usuario}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.placa_vehiculo}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.guia}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{item.created_at}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('TrasladosDetalles', { id: item.id_traslado })}>
                    <Text style={styles.buttonText}>Detalles</Text>
                  </TouchableOpacity>
              </View>
            )}
          />
        </View>
        ) : (
        <FlatList
          data={filteredTraslados}
          keyExtractor={(item) => item.id_traslado.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Motivo: {item.motivo}</Text>
              <Text style={styles.cardText}>Almacen Salida: {item.almacen_salida}</Text>
              <Text style={styles.cardText}>Almacen Entrada: {item.almacen_entrada}</Text>
              <Text style={styles.cardText}>Usuario: {item.usuario}</Text>
              <Text style={styles.cardText}>Placa: {item.placa_vehiculo}</Text>
              <Text style={styles.cardDate}>Fecha: {new Date(item.created_at).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
      {/* Botón flotante */}
      <View style={styles.floatingButtonsContainer} >
              <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Inventario')}>
                <Text style={styles.buttonText}>Inventario</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Entradas')}>
                <Text style={styles.buttonText}>Entradas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Salidas')}>
                <Text style={styles.buttonText}>Salidas</Text>
              </TouchableOpacity>
        </View>
    </View>
  );
};

export default Traslados

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
})