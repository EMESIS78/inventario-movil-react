import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
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

  const fetchEntradas = useCallback(async () => {
    if (!auth) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/entradas`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

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
  }, [auth]);

  const descargarPDF = useCallback(async () => {
    if (!auth) return;

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
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      if (auth) fetchEntradas();
    }, [auth, fetchEntradas])
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entradas de Insumos</Text>
        <View style={{ width: 28 }} />
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
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Nueva Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.redButton} onPress={descargarPDF}>
          <Ionicons name="download-outline" size={20} color="#fff" />
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
              <Text style={styles.cardTitle}>📝 Documento: {item.documento}</Text>
              <Text style={styles.cardText}>🏪 Almacén: {item.almacen}</Text>
              <Text style={styles.cardText}>👤 Usuario: {item.usuario}</Text>
              <Text style={styles.cardDate}>📅 Fecha: {new Date(item.created_at).toLocaleString()}</Text>
              <TouchableOpacity
                style={styles.blueButton}
                onPress={() => setDetalleDocumento(item.documento)}
              >
                <Ionicons name="eye-outline" size={20} color="#fff" />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563',
  },
  cardDate: {
    fontSize: 13,
    color: '#9ca3af',
    marginVertical: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
    marginRight: 6,
  },
  redButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
  },
  blueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
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
});