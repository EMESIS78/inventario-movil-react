import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../src/AuthContext';
import { API_URL } from '@env';
import CustomDropdown from '../customs/CustomDropdown';
import Alert from '../customs/Alert';

const CrearSalida = ({ visible, onClose, onSuccess }) => {
  const auth = useContext(AuthContext);
  const [almacen, setAlmacen] = useState('');
  const [productos, setProductos] = useState([]);
  const [productoTemp, setProductoTemp] = useState({ nombre: '', codigo: '', cantidad: '' });
  const [almacenes, setAlmacenes] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [p_motivo, setMotivo] = useState('');

  useEffect(() => {
    const fetchAlmacenes = async () => {
      try {
        const response = await axios.get(`${API_URL}/almacenes`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        const almacenesRaw = response.data?.data ?? response.data;

        if (!Array.isArray(almacenesRaw)) {
          console.warn('⚠️ La respuesta no es un array:', almacenesRaw);
          return;
        }

        const data = almacenesRaw.map(alm => ({
          label: alm.nombre,
          value: alm.id,
        }));

        setAlmacenes(data);
      } catch (error) {
        console.error('❌ Error al cargar almacenes:', error);
      }
    };

    fetchAlmacenes();
  }, [auth.token]);

  const fetchProductosConStock = async (idAlmacen) => {
    try {
      const res = await axios.get(`${API_URL}/productos-con-stock`, {
        params: { id_almacen: idAlmacen },
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setProductosDisponibles(res.data);
    } catch (err) {
      console.error('❌ Error al obtener productos con stock:', err);
    }
  };

  const handleAlmacenChange = (value) => {
    setAlmacen(value);
    fetchProductosConStock(value);
  };

  const handleChangeTemp = (field, value) => {
    setProductoTemp(prev => ({ ...prev, [field]: value }));
  };

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);

    if (wasSuccessful) {
      setAlmacen('');
      setMotivo('');
      setProductos([]);
      onClose();
      onSuccess();
    }
  };

  const handleAddProducto = () => {
    const { nombre, codigo, cantidad } = productoTemp;

    if (!nombre.trim() || !codigo.trim() || !cantidad || isNaN(cantidad)) {
      showCustomAlert("Producto incompleto", "Completa todos los datos antes de agregar.");
      return;
    }

    setProductos([...productos, {
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      cantidad: parseInt(cantidad)
    }]);

    // Limpiar inputs
    setProductoTemp({ nombre: '', codigo: '', cantidad: '' });
  };

  const handleEnviar = async () => {
    if (!almacen || !p_motivo) {
      showCustomAlert('Campos incompletos', 'Completa todos los campos antes de enviar.');
      return;
    }

    for (let i = 0; i < productos.length; i++) {
      const { nombre, codigo, cantidad } = productos[i];
      if (!nombre.trim() || !codigo.trim() || !cantidad || isNaN(cantidad)) {
        showCustomAlert("Producto incompleto", "Completa todos los datos del producto");
        return;
      }
    }

    try {
      const payload = {
        p_id_almacen: parseInt(almacen),
        p_motivo: p_motivo,
        p_productos: productos.map(p => ({
          id_articulo: p.nombre.trim(),
          cantidad: parseInt(p.cantidad),
        })),
        p_user_id: auth?.user?.id,
      };

      console.log('Payload:', payload);

      const response = await axios.post(`${API_URL}/registrar-salida`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      if (response.status === 201) {
        setWasSuccessful(true);
        showCustomAlert('Éxito', 'Salida registrada correctamente.');
      }
    } catch (error) {
      console.error('❌ Error al registrar salida:', error);
      setWasSuccessful(false);
      showCustomAlert('Error', 'No se pudo registrar la salida.');
    }
  };

  const buscarProducto = (index, tipo, valor) => {
    if (!valor.trim()) return;

    const producto = productosDisponibles.find(p =>
      tipo === 'nombre'
        ? p.nombre.toLowerCase() === valor.toLowerCase()
        : p.codigo.toLowerCase() === valor.toLowerCase()
    );

    if (!producto) {
      showCustomAlert('Producto no válido', 'Este producto no tiene stock o no existe.');

      // Limpiar los datos del producto inválido
      if (index === -1) {
        setProductoTemp({ nombre: '', codigo: '', cantidad: '' });
      } else {
        const updated = [...productos];
        updated[index] = { nombre: '', codigo: '', cantidad: '' };
        setProductos(updated);
      }

      return;  // Salir de la función
    }

    // Si el producto es válido, lo asignamos
    if (index === -1) {
      setProductoTemp({
        ...productoTemp,
        nombre: producto.nombre,
        codigo: producto.codigo,
      });
    } else {
      const updated = [...productos];
      updated[index] = {
        ...updated[index],
        nombre: producto.nombre,
        codigo: producto.codigo,
      };
      setProductos(updated);
    }
  };

  const handleCancel = () => {
    setAlmacen('');
    setMotivo('');
    setProductos([]);
    onClose();
  };

  const eliminarProducto = (index) => {
    const nuevos = productos.filter((_, i) => i !== index);
    setProductos(nuevos);
  };

  return (
    <Modal visible={visible} animationType="fade">
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Registrar Salida</Text>

          <CustomDropdown
            label="Selecciona un almacén"
            data={almacenes}
            selectedValue={almacen}
            onSelect={handleAlmacenChange}
          />

          <TextInput
            style={styles.input}
            placeholder="Motivo de la salida"
            value={p_motivo}
            onChangeText={setMotivo}
          />

          <Text style={styles.subtitle}>Productos</Text>

          <View style={styles.productRow}>
            <TextInput
              placeholder="Nombre"
              value={productoTemp.nombre}
              onChangeText={(text) => handleChangeTemp('nombre', text)}
              onBlur={() => buscarProducto(-1, 'nombre', productoTemp.nombre)}
              style={styles.inputSmall}
            />
            <TextInput
              placeholder="Código"
              value={productoTemp.codigo}
              onChangeText={(text) => handleChangeTemp('codigo', text)}
              onBlur={() => buscarProducto(-1, 'codigo', productoTemp.codigo)}
              style={styles.inputSmall}
            />
            <TextInput
              placeholder="Cantidad"
              value={productoTemp.cantidad}
              onChangeText={(text) => handleChangeTemp('cantidad', text)}
              style={styles.inputSmall}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddProducto}>
            <Text style={styles.addButtonText}>+ Agregar otro producto</Text>
          </TouchableOpacity>

          <Text style={styles.subtitle}>Resumen de Productos</Text>
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <Text style={styles.tableHeaderCell}>Nombre</Text>
              <Text style={styles.tableHeaderCell}>Código</Text>
              <Text style={styles.tableHeaderCell}>Cantidad</Text>
              <Text style={styles.tableHeaderCell}>Acciones</Text>
            </View>

            {productos.map((producto, index) => (
              <View key={`fila-${index}`} style={styles.tableRow}>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{producto.nombre}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{producto.codigo}</Text>
                <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode='tail'>{producto.cantidad}</Text>
                <TouchableOpacity style={styles.deleteProduct} onPress={() => eliminarProducto(index)}>
                  <Text style={styles.tableCell}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleEnviar}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Alert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={closeAlert} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10
  },
  productoContainer: {
    marginBottom: 15
  },
  addButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15
  },
  addButtonText: {
    textAlign: 'center',
    color: '#000'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    flex: 1
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    margin: 5,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    textAlign: 'center',
  },
  deleteProduct: {
    flex: 1,
    alignItems: 'center',
    padding: 1,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
});

export default CrearSalida;
