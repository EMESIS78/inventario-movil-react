import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';
import CrearEntrada from '../actions/CrearEntrada';
import EntradaDetalle from '../extras/EntradaDetalle';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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
  const [detalleDocumento, setDetalleDocumento] = useState<string | null>(null);

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

  const descargarPDF = async () => {
    try {
      const pdfUrl = `${API_URL}/reporte-entradas`;
      const fileUri = FileSystem.documentDirectory + 'reporte_entradas.pdf';

      const downloadResumable = FileSystem.createDownloadResumable(
        pdfUrl,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        console.log('📄 PDF descargado en:', result.uri);
        await Sharing.shareAsync(result.uri);
      } else {
        console.warn('⚠️ La descarga no se completó correctamente.');
      }
    } catch (error) {
      console.error('❌ Error al descargar PDF:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Entradas</Text>
      </View>

      {/* Barra de búsqueda */}
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por documento o almacen"
        value={search}
        onChangeText={setSearch}
      />

      {/*Botones*/}
      <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
        <TouchableOpacity style={styles.greenButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Nueva Entrada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.redButton} onPress={descargarPDF}>
          <Text style={styles.buttonText}>Descargar PDF</Text>
        </TouchableOpacity>
      </View>

      {filteredEntradas.length === 0 ? (
        <Text style={styles.noDataText}>No se encontraron entradas</Text>
      ) : isLandscape ? (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>#</Text>
              <Text style={styles.tableHeaderText}>Documento</Text>
              <Text style={styles.tableHeaderText}>Almacen</Text>
              <Text style={styles.tableHeaderText}>Usuario</Text>
              <Text style={styles.tableHeaderText}>Fecha</Text>
              <Text style={styles.tableHeaderText}>Acciones</Text>
            </View>

            {filteredEntradas.map((item) => (
              <View key={item.id_entrada} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.id_entrada}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
                  {item.documento}
                </Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
                  {item.almacen}
                </Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
                  {item.usuario}
                </Text>
                <Text style={styles.tableCell}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={styles.blueButton}
                  onPress={() => setDetalleDocumento(item.documento)}
                >
                  <Text style={styles.buttonText}>Ver Detalles</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
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
              <TouchableOpacity
                style={styles.blueButton}
                onPress={() => setDetalleDocumento(item.documento)}
              >
                <Text style={styles.buttonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <CrearEntrada visible={modalVisible} onClose={() => setModalVisible(false)} onSuccess={fetchEntradas} />
      {detalleDocumento && (
        <EntradaDetalle
          visible={!!detalleDocumento}
          onClose={() => setDetalleDocumento(null)}
          documento={detalleDocumento}
        />
      )}
    </View >
  );
};

export default Entradas

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
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    marginHorizontal: 10,
  },
  buttonContainerLandscape: {
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  greenButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  redButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  blueButton: {
    backgroundColor: '#007bff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  tableContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4287f5',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 4,
    marginHorizontal: 4,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 4,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    borderRadius: 6,
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    textAlign: 'center',
    color: '#444',
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10, // Asegura que esté por encima de otros elementos
  },
});