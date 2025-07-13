import React, { useCallback, useContext, useState } from 'react';
import { View, ActivityIndicator, FlatList, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '@env';

import { AuthContext } from '../../../src/AuthContext';
import CrearEntrada from '../../actions/CrearEntrada';
import EntradaDetalle from '../../extras/EntradaDetalle';

import EntradasHeader from './EntradasHeader';
import EntradasSearchBar from './EntradasSearchBar';
import EntradasButtons from './EntradasButtons';
import EntradaCard from './EntradaCard';

const Entradas = ({ navigation }) => {
  const auth = useContext(AuthContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detalleDocumento, setDetalleDocumento] = useState(null);

  const fetchEntradas = useCallback(async () => {
    if (!auth) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/entradas`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.data.success) {
        setEntradas(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener entradas:', error);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const descargarPDF = useCallback(async () => {
    if (!auth) return;

    try {
      const fileUri = FileSystem.documentDirectory + 'reporte_entradas.pdf';
      const downloadResumable = FileSystem.createDownloadResumable(
        `${API_URL}/reporte-entradas`,
        fileUri,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) await Sharing.shareAsync(result.uri);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
    }
  }, [auth]);

  useFocusEffect(useCallback(() => {
    fetchEntradas();
  }, [fetchEntradas]));

  const entradasFiltradas = entradas.filter((e) =>
    e.documento.toLowerCase().includes(search.toLowerCase()) ||
    e.almacen.toLowerCase().includes(search.toLowerCase()) ||
    e.usuario.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <EntradasHeader onMenuPress={() => navigation.openDrawer()} />
      <EntradasSearchBar value={search} onChange={setSearch} />
      <EntradasButtons
        isLandscape={isLandscape}
        onNuevaEntrada={() => setModalVisible(true)}
        onDescargarPDF={descargarPDF}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : entradasFiltradas.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>
          No se encontraron entradas
        </Text>
      ) : (
        <FlatList
          data={entradasFiltradas}
          keyExtractor={(item) => item.id_entrada.toString()}
          renderItem={({ item }) => (
            <EntradaCard entrada={item} onVerDetalle={() => setDetalleDocumento(item.documento)} />
          )}
        />
      )}

      <CrearEntrada visible={modalVisible} onClose={() => setModalVisible(false)} onSuccess={fetchEntradas} />

      {detalleDocumento && (
        <EntradaDetalle
          visible
          documento={detalleDocumento}
          onClose={() => setDetalleDocumento(null)}
        />
      )}
    </View>
  );
};

export default Entradas;
