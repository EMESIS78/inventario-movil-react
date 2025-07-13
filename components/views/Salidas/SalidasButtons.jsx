import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SalidasButtons = ({ isLandscape, onNuevaSalida, onDescargarPDF }) => (
  <View style={[styles.container, isLandscape && styles.landscape]}>
    <TouchableOpacity style={styles.green} onPress={onNuevaSalida}>
      <Ionicons name="add-circle-outline" size={20} color="#fff" />
      <Text style={styles.text}>Nueva Salida</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.red} onPress={onDescargarPDF}>
      <Ionicons name="download-outline" size={20} color="#fff" />
      <Text style={styles.text}>Descargar PDF</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    marginHorizontal: 10,
  },
  landscape: {
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  green: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
    marginRight: 6,
  },
  red: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default SalidasButtons;
