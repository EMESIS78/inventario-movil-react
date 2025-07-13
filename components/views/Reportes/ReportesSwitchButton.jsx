import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ReportesSwitchButton = ({ mostrarGlobal, onToggle }) => (
  <TouchableOpacity style={styles.button} onPress={onToggle}>
    <Text style={styles.text}>
      {mostrarGlobal ? 'Ver Informe de Inventario' : 'Ver Informe Global'}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ReportesSwitchButton;
