import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Productos: undefined;
  Almacenes: undefined;
  Usuarios: undefined;
  Inventario: undefined;
  Salidas: undefined;
  Entradas: undefined;
  Traslados: undefined;

  // Agrega más pantallas si es necesario
};

export type RootDrawerParamList = {
  Home: undefined;
  Productos: undefined;
  Almacenes: undefined;
  Usuarios: undefined;
  Inventario: undefined;
  Salidas: undefined;
  Entradas: undefined;
  Traslados: undefined;
  // Agrega más opciones del Drawer
};

// Tipo específico para el Stack Navigator
export type StackNavProp = StackNavigationProp<RootStackParamList>;

// Tipo específico para el Drawer Navigator
export type DrawerNavProp = DrawerNavigationProp<RootDrawerParamList>;