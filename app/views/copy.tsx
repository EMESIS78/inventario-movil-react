import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { AuthContext } from '../../src/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';

const COLORS = {
  background: '#F9FAFB',
  primary: '#0F172A',
  secondary: '#1E3A8A',
  accent: '#3B82F6',
  text: '#1F2937',
  textLight: '#6B7280',
  white: '#FFFFFF',
  danger: '#DC2626',
  cardShadow: '#CBD5E1',
};

const menuItems = [
  { name: 'Insumos', icon: 'hive', roles: ['admin', 'supervisor', 'usuario'], route: 'Insumos' },
  { name: 'Platos', icon: 'restaurant', roles: ['admin', 'supervisor', 'usuario'], route: 'Platos' },
  { name: 'Entradas', icon: 'arrow-circle-up', roles: ['admin', 'supervisor', 'usuario'], route: 'Entradas' },
  { name: 'Salidas', icon: 'arrow-circle-down', roles: ['admin', 'supervisor', 'usuario'], route: 'Salidas' },
  { name: 'Establecimientos', icon: 'warehouse', roles: ['admin', 'supervisor', 'usuario'], route: 'Establecimientos' },
  { name: 'Usuarios', icon: 'people', roles: ['admin'], route: 'Usuarios' },
  { name: 'Proveedores', icon: 'business', roles: ['admin'], route: 'Proveedores' },
];

const HomeScreen = () => {
  const navigation = useNavigation<DrawerNavProp>();
  const auth = useContext(AuthContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  if (!auth) return <Text>Error: AuthContext no disponible</Text>;

  const { user, logout } = auth;
  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.rol || ''));
  const cardSize = isLandscape ? width / 4.5 : width / 2.2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, {user?.name || 'Usuario'}</Text>
      <Text style={styles.subtitle}>Rol: {user?.rol || 'Sin rol'}</Text>

      <ScrollView contentContainerStyle={styles.menuGrid}>
        {filteredMenu.map((item) => (
          <Pressable
            key={item.route}
            style={[styles.card, { width: cardSize, height: cardSize }]}
            onPress={() => navigation.navigate(item.route as never)}
          >
            <MaterialIcons name={item.icon as never} size={40} color={COLORS.accent} />
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
    backgroundColor: COLORS.background,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  card: {
    backgroundColor: COLORS.white,
    margin: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
});
