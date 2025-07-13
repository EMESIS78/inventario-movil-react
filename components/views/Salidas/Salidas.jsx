import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { AuthContext } from '../../../src/AuthContext';
import CrearSalida from '../../actions/CrearSalida';
import SalidaDetalle from '../../extras/SalidaDetalle';

import SalidasHeader from './SalidasHeader';
import SalidasSearchBar from './SalidasSearchBar';
import SalidasButtons from './SalidasButtons';
import SalidaCard from './SalidaCard';

const Salidas = ({ navigation }) => {
  const auth = useContext(AuthContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [salidas, setSalidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detalleDocumento, setDetalleDocumento] = useState(null);

  const fetchSalidas = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/salidas`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (data.success) setSalidas(data.data);
    } catch (err) {
      console.error('Error al obtener salidas:', err);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const descargarPDF = useCallback(async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'reporte_salidas.pdf';
      const downloadResumable = FileSystem.createDownloadResumable(
        `${API_URL}/reporte-salidas`,
        fileUri,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) await Sharing.shareAsync(result.uri);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
    }
  }, [auth]);

  useFocusEffect(useCallback(() => {
    fetchSalidas();
  }, [fetchSalidas]));

  if (!auth) return <Text>Error: No autenticado</Text>;
  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  const salidasFiltradas = salidas.filter(s =>
    s.almacen.toLowerCase().includes(search.toLowerCase()) ||
    s.motivo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <SalidasHeader onMenuPress={() => navigation.openDrawer()} />
      <SalidasSearchBar value={search} onChange={setSearch} />
      <SalidasButtons
        isLandscape={isLandscape}
        onNuevaSalida={() => setModalVisible(true)}
        onDescargarPDF={descargarPDF}
      />

      {salidasFiltradas.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }}>
          No hay salidas registradas.
        </Text>
      ) : (
        <FlatList
          data={salidasFiltradas}
          keyExtractor={item => item.id_salida.toString()}
          renderItem={({ item }) => (
            <SalidaCard
              salida={item}
              onVerDetalle={() => setDetalleDocumento(item.id_salida.toString())}
            />
          )}
        />
      )}

      <CrearSalida
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchSalidas}
      />

      {detalleDocumento && (
        <SalidaDetalle
          visible
          id_salida={detalleDocumento}
          onClose={() => setDetalleDocumento(null)}
        />
      )}
    </View>
  );
};

export default Salidas;
