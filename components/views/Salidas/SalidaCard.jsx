import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SalidaCard = ({ salida, onVerDetalle }) => (
  <View style={styles.card}>
    <Text style={styles.title}>📝 Motivo: {salida.motivo}</Text>
    <Text style={styles.text}>🏪 Almacén: {salida.almacen}</Text>
    <Text style={styles.text}>👤 Usuario: {salida.usuario}</Text>
    <Text style={styles.date}>📅 Fecha: {new Date(salida.created_at).toLocaleString()}</Text>
    <TouchableOpacity style={styles.button} onPress={onVerDetalle}>
      <Ionicons name="eye-outline" size={20} color="#fff" />
      <Text style={styles.buttonText}>Ver Detalles</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 10,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#4b5563',
  },
  date: {
    fontSize: 13,
    color: '#9ca3af',
    marginVertical: 6,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default SalidaCard;
