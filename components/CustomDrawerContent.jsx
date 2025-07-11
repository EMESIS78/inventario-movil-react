import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from '@/src/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const CustomDrawerContent = (props) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/images/logo3copy.png')} style={styles.avatar} />
                <Text style={styles.name}>{user?.name || 'Invitado'}</Text>
                <Text style={styles.role}>{user?.rol || 'Sin rol'}</Text>
            </View>

            {/* Menú de navegación con scroll */}
            <View style={styles.menu}>
                <DrawerItem
                    label="Inicio"
                    onPress={() => props.navigation.navigate('Home')}
                    icon={() => <Ionicons name="home-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Insumos"
                    onPress={() => props.navigation.navigate('Insumos')}
                    icon={() => <Ionicons name="cube-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Platos"
                    onPress={() => props.navigation.navigate('Platos')}
                    icon={() => <Ionicons name="restaurant-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Establecimientos"
                    onPress={() => props.navigation.navigate('Establecimientos')}
                    icon={() => <Ionicons name="business-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Salidas"
                    onPress={() => props.navigation.navigate('Salidas')}
                    icon={() => <Ionicons name="exit-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Entradas"
                    onPress={() => props.navigation.navigate('Entradas')}
                    icon={() => <Ionicons name="log-in-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Proveedores"
                    onPress={() => props.navigation.navigate('Proveedores')}
                    icon={() => <Ionicons name="people-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Usuarios"
                    onPress={() => props.navigation.navigate('Usuarios')}
                    icon={() => <Ionicons name="person-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Reportes"
                    onPress={() => props.navigation.navigate('Reportes')}
                    icon={() => <Ionicons name="bar-chart-outline" size={20} color="#333" />}
                    labelStyle={styles.label}
                />
            </View>

            {/* Botón de cerrar sesión */}
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#2563eb',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    name: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    role: {
        color: '#cbd5e1',
        fontSize: 14,
    },
    menu: {
        marginTop: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d9534f',
        padding: 12,
        margin: 20,
        borderRadius: 8,
        justifyContent: 'center',
    },
    logoutText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
});
