import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../src/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { useWindowDimensions } from 'react-native';


const COLORS = {
  background: '#F4F6F9',
  primary: '#003366', // Azul corporativo oscuro
  secondary: '#00509E', // Azul intermedio
  accent: '#0096FF', // Azul más vivo para destacar
  text: '#1C1C1C',
  textLight: '#6C757D',
  white: '#FFFFFF',
  danger: '#D9534F', // Rojo para la salida
};

const menuItems = [
  { name: 'Productos', icon: 'store', roles: ['admin', 'supervisor', 'usuario'], route: 'Productos' },
  { name: 'Almacenes', icon: 'warehouse', roles: ['admin', 'supervisor', 'usuario'], route: 'Almacenes' },
  { name: 'Inventario', icon: 'inventory', roles: ['admin', 'supervisor', 'usuario'], route: 'Inventario' },
  { name: 'Entrada de Mercadería', icon: 'login', roles: ['admin', 'usuario'], route: 'Entradas' },
  { name: 'Salida de Mercadería', icon: 'logout', roles: ['admin', 'usuario'], route: 'Salidas' },
  { name: 'Traslado de Mercadería', icon: 'local-shipping', roles: ['admin', 'usuario'], route: 'Traslados' },
  { name: 'Usuarios', icon: 'people', roles: ['admin'], route: 'Usuarios' },
  { name: 'Proveedores', icon: 'business', roles: ['admin'], route: 'Proveedores' },
];

const HomeScreen = () => {
  const navigation = useNavigation<DrawerNavProp>();
  const auth = useContext(AuthContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height; // Ahora detecta la orientación correctamente


  if (!auth) {
    return <Text>Error: AuthContext no disponible</Text>;
  }

  const { user, logout } = auth;
  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.rol || ''));
  const cardSize = isLandscape ? width / 4.5 : width / 2.5;

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      {/* Botón para abrir el Drawer
      <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
        <MaterialIcons name="menu" size={28} color={COLORS.primary} />
      </TouchableOpacity> */}

      <Text style={styles.title}>Bienvenido, {user?.name || 'Usuario'}</Text>
      <Text style={styles.subtitle}>Rol: {user?.rol || 'Sin rol'}</Text>

      <ScrollView contentContainerStyle={[styles.menuContainer, isLandscape && styles.menuContainerLandscape,]}>
        {filteredMenu.map((item) => (
          <Pressable
            key={item.route}
            style={[styles.card, { width: cardSize, height: cardSize }]}
            onPress={() => navigation.navigate(item.route as never)}
          >
            <MaterialIcons name={item.icon as never} size={40} color={COLORS.primary} />
            <Text style={styles.cardText}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.logoutButton} onPress={async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
      }}>
        <MaterialIcons name="exit-to-app" size={20} color={COLORS.white} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </Pressable>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 40,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  containerLandscape: {
    flexDirection: 'column', // Mantiene los elementos en columna
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10, // Para que quede encima de otros elementos
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  menuContainerLandscape: {
    justifyContent: 'space-evenly',
  },
  card: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  cardText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    position: 'absolute',
    bottom: 20,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
});