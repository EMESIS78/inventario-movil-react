import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from '@/src/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const menuItems = [
    { name: 'Inicio', icon: 'home-outline', roles: ['admin', 'supervisor', 'usuario'], route: 'Home' },
    { name: 'Insumos', icon: 'cube-outline', roles: ['admin', 'supervisor', 'usuario'], route: 'Insumos' },
    { name: 'Platos', icon: 'restaurant-outline', roles: ['admin', 'supervisor', 'usuario'], route: 'Platos' },
    { name: 'Entradas', icon: 'log-in-outline', roles: ['admin', 'supervisor', 'usuario'], route: 'Entradas' },
    { name: 'Salidas', icon: 'exit-outline', roles: ['admin', 'supervisor', 'usuario'], route: 'Salidas' },
    { name: 'Establecimientos', icon: 'business-outline', roles: ['admin', 'supervisor', 'usuario'], route: 'Establecimientos' },
    { name: 'Usuarios', icon: 'person-outline', roles: ['admin'], route: 'Usuarios' },
    { name: 'Proveedores', icon: 'people-outline', roles: ['admin'], route: 'Proveedores' },
    { name: 'Reportes', icon: 'bar-chart-outline', roles: ['admin', 'supervisor'], route: 'Reportes' },
];

const CustomDrawerContent = (props) => {
    const { user, logout } = useContext(AuthContext);

    // ✅ Filtrar menús según rol
    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.rol || ''));

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/images/logo3copy.png')} style={styles.avatar} />
                <Text style={styles.name}>{user?.name || 'Invitado'}</Text>
                <Text style={styles.role}>{user?.rol || 'Sin rol'}</Text>
            </View>

            {/* ✅ Menú dinámico */}
            <View style={styles.menu}>
                {filteredMenu.map(item => (
                    <DrawerItem
                        key={item.route}
                        label={item.name}
                        onPress={() => props.navigation.navigate(item.route)}
                        icon={() => <Ionicons name={item.icon} size={20} color="#333" />}
                        labelStyle={styles.label}
                    />
                ))}
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
