import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { AuthContext } from '../../src/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerNavProp } from '@/src/navigation/navigationTypes';
import { useWindowDimensions } from 'react-native';
import io from 'socket.io-client';
import { API_URL, SOCKET_URL } from '@env';

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
  { name: 'Reportes', icon: 'assessment', roles: ['admin', 'supervisor'], route: 'Reportes' },
];

const socket = io(SOCKET_URL);

const HomeScreen = () => {
  const navigation = useNavigation<DrawerNavProp>();
  const auth = useContext(AuthContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height; // Ahora detecta la orientación correctamente

  type Notification = {
    mensaje: string;
    fecha: string;
    usuario: string;
    motivo: string;
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  useEffect(() => {
    socket.on('salida-registrada', (data) => {
      console.log('📡 Notificación recibida:', data);
      setNotifications((prev) => [...prev, data]);
    });

    return () => {
      socket.off('salida-registrada');
    };
  }, []);

  if (!auth) return <Text>Error: AuthContext no disponible</Text>;

  const { user, logout } = auth;
  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.rol || ''));
  const cardSize = isLandscape ? width / 4.5 : width / 2.5;

  const clearNotifications = () => {
    setNotifications([]);
    setNotificationModalVisible(false);
  };

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Bienvenido, {user?.name || 'Usuario'}</Text>
        <View style={styles.roleContainer}>
          <Text style={styles.subtitle}></Text>
          {user?.rol === 'admin' && (
            <TouchableOpacity onPress={() => setNotificationModalVisible(true)} style={styles.bellButton}>
              <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.menuContainer, isLandscape && styles.menuContainerLandscape]}>
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

      {/* Modal Notificaciones */}
      <Modal visible={notificationModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Notificaciones</Text>
            <ScrollView>
              {notifications.length > 0 ? (
                notifications.map((n, idx) => (
                  <View key={idx} style={styles.notificationCard}>
                    <Text>{n.mensaje}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.textLight }}>{n.fecha}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.textLight }}>Usuario: {n.usuario}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.textLight }}>Motivo: {n.motivo}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: 'center' }}>No hay notificaciones nuevas.</Text>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.clearButton} onPress={clearNotifications}>
              <Text style={styles.clearButtonText}>Cerrar Notificaciones</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'column', // Mantiene los elementos en columna
    alignItems: 'center',
    paddingHorizontal: 20,
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
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  menuContainerLandscape: {
    justifyContent: 'space-evenly',
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
  headerRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bellButton: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: COLORS.danger,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  clearButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});