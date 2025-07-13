import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReporteCard = ({
  producto,
  global,
  editingItem,
  nuevoStock,
  onChangeStock,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onVerMovimientos
}) => (
  <TouchableOpacity onPress={onVerMovimientos}>
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="cube-outline" size={22} color="#2563eb" />
        <Text style={styles.cardTitle}>{producto.nombre}</Text>
      </View>

      {global ? (
        <>
          <CardRow label="ID Producto:" value={producto.id_producto} />
          <CardRow label="Existencia Total:" value={producto.existencia} />
        </>
      ) : (
        <>
          <CardRow label="Marca:" value={producto.marca} />
          <CardRow label="Ubicación:" value={producto.ubicacion} />
          <View style={styles.cardRow}>
            <Text style={styles.label}>Stock:</Text>
            {editingItem === producto.id_producto ? (
              <>
                <TextInput
                  value={nuevoStock}
                  onChangeText={onChangeStock}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="Nuevo stock"
                />
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity style={styles.saveButton} onPress={onSaveEdit}>
                    <Text style={styles.buttonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={onCancelEdit}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.value}>{producto.stock}</Text>
                <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                  <Text style={styles.buttonText}>Ajustar Stock</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <CardRow label="Almacén:" value={producto.nombre_almacen} />
        </>
      )}
    </View>
  </TouchableOpacity>
);

const CardRow = ({ label, value }) => (
  <View style={styles.cardRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    borderRadius: 8,
    width: 100,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    padding: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ReporteCard;
