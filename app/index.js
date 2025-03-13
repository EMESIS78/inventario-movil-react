import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AuthProvider, AuthContext } from '../src/AuthContext';
import LoadingApp from './views/LoadingApp';
import LoginScreen from './views/LoginScreen';
import HomeScreen from './views/HomeScreen';
import Productos from '../components/views/Productos';
import Almacenes from '../components/views/Almacenes';
import Usuarios from '../components/views/Usuarios';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Productos" component={Productos} />
      <Drawer.Screen name="Almacenes" component={Almacenes} />
      <Drawer.Screen name="Usuarios" component={Usuarios} />

      {/* Agrega más pantallas aquí */}
    </Drawer.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    return <LoadingApp />; // Previene errores si el contexto no está disponible
  }

  const { user, loading } = auth;

  if (loading) {
    return <LoadingApp />; // Se muestra LoadingApp hasta que se verifique la sesión
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={StackNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const index = () => {
  return (
    <AuthProvider>

      <AppNavigator />
      
    </AuthProvider>
  );
};

export default index;