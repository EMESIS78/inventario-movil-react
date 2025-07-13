import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlatoCard = ({ plato, expandido, onExpand, onEdit, onDelete }) => (
  <View style={styles.card}>
    <Image source={{ uri: plato.imagen }} style={styles.image} resizeMode="cover" />
    <View style={styles.info}>
      <Text style={styles.nombre}>{plato.nombre}</Text>
      <Text
        style={styles.descripcion}
        numberOfLines={expandido === plato.id_plato ? undefined : 2}
        ellipsizeMode="tail"
      >
        {plato.descripcion}
      </Text>

      {plato.descripcion.length > 80 && (
        <TouchableOpacity onPress={() => onExpand(expandido === plato.id_plato ? null : plato.id_plato)}>
          <Text style={styles.verMas}>
            {expandido === plato.id_plato ? 'Mostrar menos' : `+ ${plato.insumos.length - 2} más`}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.precio}>Precio: €{parseFloat(plato.precio).toFixed(2)}</Text>
    </View>

    <View style={styles.insumos}>
      {(expandido === plato.id_plato ? plato.insumos : plato.insumos.slice(0, 2)).map(insumo => (
        <View key={insumo.id_producto} style={styles.insumoItem}>
          <Text style={styles.insumoNombre}>{insumo.nombre_producto}</Text>
          <Text style={styles.insumoCantidad}>Cantidad: {insumo.cantidad_requerida}</Text>
        </View>
      ))}
    </View>

    <View style={styles.buttons}>
      <TouchableOpacity style={styles.edit} onPress={onEdit}>
        <Ionicons name="create-outline" size={22} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.delete} onPress={onDelete}>
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginBottom: 10,
  },
  info: {
    marginBottom: 8,
  },
  nombre: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  descripcion: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 18,
  },
  verMas: {
    fontSize: 13,
    color: '#3b82f6',
    marginTop: 6,
    fontWeight: 'bold',
  },
  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginTop: 6,
  },
  insumos: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  insumoItem: {
    marginBottom: 6,
  },
  insumoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  insumoCantidad: {
    fontSize: 13,
    color: '#6b7280',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  edit: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  delete: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
});

export default PlatoCard;
