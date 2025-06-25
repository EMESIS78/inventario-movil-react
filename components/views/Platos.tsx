import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Image } from 'react-native';
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
    const [platoExpandido, setPlatoExpandido] = useState<number | null>(null);

    const fetchPlatos = useCallback(async () => {
        if (!auth) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/platos`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            const fetchedPlatos = response.data.map((plato: Plato) => ({
                ...plato,
                precio: isNaN(plato.precio) ? 0 : plato.precio,
            }));
            setPlatos(fetchedPlatos);
            console.log('✅ Platos actualizados');
        } catch (error) {
            console.error('❌ Error al obtener platos:', error);
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useFocusEffect(
        useCallback(() => {
            if (auth) fetchPlatos();
        }, [auth, fetchPlatos])
    );

    if (!auth) {
        return <Text>Error: No se pudo cargar el contexto de autenticación.</Text>;
    }

    const { user, token } = auth;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu-outline" size={28} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.title}>Lista de Platos</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Buscador */}
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
                    numColumns={numColumns}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image
                                source={{ uri: `http://192.168.0.86:3000/uploads/${item.imagen}` }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                            <View style={styles.platoInfo}>
                                <Text style={styles.platoNombre}>{item.nombre}</Text>

                                <Text
                                    style={styles.platoDescripcion}
                                    numberOfLines={platoExpandido === item.id_plato ? undefined : 2}
                                    ellipsizeMode="tail"
                                >
                                    {item.descripcion}
                                </Text>

                                {item.descripcion.length > 80 && platoExpandido !== item.id_plato && (
                                    <TouchableOpacity onPress={() => setPlatoExpandido(platoExpandido === item.id_plato ? null : item.id_plato)}>
                                        <Text style={{ fontSize: 13, color: '#3b82f6', marginTop: 6, fontWeight: 'bold' }}>
                                            {platoExpandido === item.id_plato ? 'Mostrar menos' : `+ ${item.insumos.length - 2} más`}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <Text style={styles.platoPrecio}>
                                    Precio: €{typeof item.precio === 'string'
                                        ? parseFloat(item.precio).toFixed(2)
                                        : item.precio.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.insumosContainer}>
                                {(platoExpandido === item.id_plato
                                    ? item.insumos
                                    : item.insumos.slice(0, 2)
                                ).map((insumo) => (
                                    <View key={insumo.id_producto} style={styles.insumoInfo}>
                                        <Text style={styles.insumoNombre}>{insumo.nombre_producto}</Text>
                                        <Text style={styles.insumoCantidad}>Cantidad: {insumo.cantidad_requerida}</Text>
                                    </View>
                                ))}

                                {item.insumos.length > 2 && platoExpandido !== item.id_plato && (
                                    <TouchableOpacity onPress={() => setPlatoExpandido(item.id_plato)}>
                                        <Text style={{ fontSize: 13, color: '#007bff', marginTop: 4 }}>
                                            + {item.insumos.length - 2} más
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setPlatoSeleccionado(item)}
                                >
                                    <Ionicons name="create-outline" size={22} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => setPlatoAEliminar(item)}
                                >
                                    <Ionicons name="trash-outline" size={22} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Modal para crear plato */}
            <CrearPlato
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreated={() => {
                    setModalVisible(false);
                    fetchPlatos();
                }}
            />

            {/* Botón flotante */}
            {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 3,
    },
    menuButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    searchInput: {
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        fontSize: 15,
        color: '#111827',
    },
    card: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginVertical: 6,
        padding: 16,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    productImage: {
        width: '100%',
        height: 160,
        borderRadius: 14,
        marginBottom: 10,
    },
    platoInfo: {
        marginBottom: 8,
    },
    platoNombre: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2,
    },
    platoDescripcion: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 18,
    },
    platoPrecio: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#22c55e',
        marginTop: 6,
    },
    insumosContainer: {
        backgroundColor: '#f9fafb',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
    },
    insumoInfo: {
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    editButton: {
        backgroundColor: '#3b82f6',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#3b82f6',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
    },
});

export default Platos;