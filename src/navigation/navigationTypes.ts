import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Insumos: undefined;
  Platos: undefined;
  Almacenes: undefined;
  Usuarios: undefined;
  Salidas: undefined;
  Entradas: undefined;
  Proveedores: undefined;

  // Agrega más pantallas si es necesario
};

export type RootDrawerParamList = {
  Home: undefined;
  Insumos: undefined;
  Platos: undefined;
  Almacenes: undefined;
  Usuarios: undefined;
  Salidas: undefined;
  Entradas: undefined;
  Proveedores: undefined;
  // Agrega más opciones del Drawer
};

// Tipo específico para el Stack Navigator
export type StackNavProp = StackNavigationProp<RootStackParamList>;

// Tipo específico para el Drawer Navigator
export type DrawerNavProp = DrawerNavigationProp<RootDrawerParamList>;