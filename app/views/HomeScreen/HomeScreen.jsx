import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { AuthContext } from '../../../src/AuthContext';
import io from 'socket.io-client';
import { API_URL, SOCKET_URL } from '@env';
import HomeHeader from './HomeHeader';
import MenuGrid from './MenuGrid';
import NotificationModal from './NotificationModal';

const COLORS = {
  background: '#F9FAFB',
  primary: '#0F172A',
  danger: '#DC2626',
  white: '#FFFFFF',
};

const menuItems = [
  { name: 'Insumos', icon: 'hive', roles: ['admin', 'supervisor', 'usuario'], route: 'Insumos' },
  { name: 'Platos', icon: 'restaurant', roles: ['admin', 'supervisor', 'usuario'], route: 'Platos' },
  { name: 'Entradas', icon: 'arrow-circle-up', roles: ['admin', 'supervisor', 'usuario'], route: 'Entradas' },
  { name: 'Salidas', icon: 'arrow-circle-down', roles: ['admin', 'supervisor', 'usuario'], route: 'Salidas' },
  { name: 'Establecimientos', icon: 'warehouse', roles: ['admin', 'supervisor', 'usuario'], route: 'Establecimientos' },
  { name: 'Usuarios', icon: 'people', roles: ['admin'], route: 'Usuarios' },
  { name: 'Proveedores', icon: 'business', roles: ['admin'], route: 'Proveedores' },
  { name: 'Reportes', icon: 'assessment', roles: ['admin', 'supervisor'], route: 'Reportes' },
];

const socket = io(SOCKET_URL);

const HomeScreen = () => {
  const auth = useContext(AuthContext);
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [notifications, setNotifications] = useState([]);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  useEffect(() => {
    socket.on('salida-registrada', data => setNotifications(prev => [...prev, data]));
    socket.on('entrada-registrada', data => setNotifications(prev => [...prev, data]));
    socket.on('ajuste-stock', data => setNotifications(prev => [...prev, data]));

    return () => {
      socket.off('salida-registrada');
      socket.off('entrada-registrada');
      socket.off('ajuste-stock');
    };
  }, []);

  if (!auth) return <Text>Error: AuthContext no disponible</Text>;

  const { user, logout } = auth;
  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.rol || ''));
  const cardSize = isLandscape ? width / 4.5 : width / 2.5;

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      <HomeHeader
        user={user}
        notifications={notifications}
        onOpenNotifications={() => setNotificationModalVisible(true)}
      />

      <MenuGrid menuItems={filteredMenu} cardSize={cardSize} navigation={navigation} />

      <Pressable
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </Pressable>

      <NotificationModal
        visible={notificationModalVisible}
        notifications={notifications}
        onClose={() => {
          setNotifications([]);
          setNotificationModalVisible(false);
        }}
      />
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
  containerLandscape: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutButton: {
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
    fontWeight: '600',
  },
});
