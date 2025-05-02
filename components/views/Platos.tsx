import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { API_URL } from '@env';
import { AuthContext } from '../../src/AuthContext';
import CrearPlato from '../actions/CrearPlato';
import EditarPlato from '../actions/EditarPlato';
import EliminarPlato from '../actions/EliminarPlato';
import { useWindowDimensions } from 'react-native'

interface Insumo {
    id_producto: number;
    nombre_producto: string;
    cantidad_requerida: number;
}

interface Plato {
    id_plato: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    insumos: Insumo[];
}

const Platos = () => {
    const auth = useContext(AuthContext);
    const navigation = useNavigation<DrawerNavProp>();
    const [platos, setPlatos] = useState<Plato[]>([]);
    const [platoSeleccionado, setPlatoSeleccionado] = useState<Plato | null>(null);
    const [platoAEliminar, setPlatoAEliminar] = useState<Plato | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { width, height } = useWindowDimensions(); // Detecta tamaño de pantalla
    const [modalVisible, setModalVisible] = useState(false);
    const isLandscape = width > height; // Verifica si está en horizontal
    const numColumns = isLandscape ? 3 : 1;

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    const { user, token } = auth;

    const fetchPlatos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/platos`);
            const fetchedPlatos = response.data.map((plato: Plato) => ({
                ...plato,
                precio: isNaN(plato.precio) ? 0 : plato.precio, // Asegurando que precio sea un número
            }));
            setPlatos(fetchedPlatos);
            console.log('✅ Platos actualizados');
        } catch (error) {
            console.error('❌ Error al obtener platos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPlatos();
        }, [fetchPlatos, search])
    );

    return (
        <View style={styles.container}>
            {/* Botón de menú hamburguesa */}
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>Lista de Platos</Text>

            {/* Campo de búsqueda */}
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar plato..."
                value={search}
                onChangeText={setSearch}
            />

            {/* Lista de platos */}
            {loading ? (
                            <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
                        ) : (
            <FlatList
                key={`flatlist-${numColumns}`}
                data={platos.filter((plato) =>
                    plato.nombre.toLowerCase().includes(search.toLowerCase())
                )}
                keyExtractor={(item) => item.id_plato.toString()}
                numColumns={numColumns} // 1 columna en vertical, 2 en horizontal
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => {
                    return (
                        <View style={[styles.card]}>
                            <Image
                                source={{ uri: `http://192.168.0.86:3000/uploads/${item.imagen}` }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                            <View style={styles.platoInfo}>
                                <Text style={styles.platoNombre}>{item.nombre}</Text>
                                <Text style={styles.platoDescripcion}>{item.descripcion}</Text>
                                <Text style={styles.platoPrecio}>
                                    Precio: €{typeof item.precio === 'string' ? parseFloat(item.precio).toFixed(2) : item.precio.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.insumosContainer}>
                                {item.insumos.map((insumo) => (
                                    <View key={insumo.id_producto} style={styles.insumoInfo}>
                                        <Text style={styles.insumoNombre}>{insumo.nombre_producto}</Text>
                                        <Text style={styles.insumoCantidad}>Cantidad: {insumo.cantidad_requerida}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.buttonContainer}>
                                {/* Botón de Editar */}
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setPlatoSeleccionado(item)}
                                >
                                    <Ionicons name="create-outline" size={24} color="white" />
                                </TouchableOpacity>
                                {/* Botón de Eliminar */}
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => setPlatoAEliminar(item)}
                                >
                                    <Ionicons name="trash-outline" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />

                        )}

            {/* Modal para crear plato */}
            <CrearPlato
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreated={() => {
                    setModalVisible(false);
                    fetchPlatos(); // Refresca la lista
                }}
            />

            {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    menuButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10, // Asegura que esté por encima de otros elementos
    },
    card: {
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchInput: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    description: {
        marginTop: 4,
        fontSize: 14,
        color: '#444'
    },
    price: {
        marginTop: 4,
        fontWeight: '600'
    },
    subtitle: {
        marginTop: 8,
        fontWeight: 'bold'
    },
    insumo: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333'
    },
    platoInfo: {
        flex: 1,
    },
    platoNombre: {
        width: '100%',
        fontSize: 18,
        fontWeight: 'bold',
    },
    platoDescripcion: {
        fontSize: 14,
        color: 'gray',
    },
    platoPrecio: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
        marginTop: 5,
    },
    insumosContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#e9ecef',
        borderRadius: 8,
    },
    insumoInfo: {
        marginBottom: 8,
    },
    insumoNombre: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    insumoCantidad: {
        fontSize: 14,
        color: 'gray',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    editButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#DC3545',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007bff',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    fabText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    productImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
});

export default Platos;