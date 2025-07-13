import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDrawerContent from '../components/CustomDrawerContent';
import Almacenes from '../components/views/Almacenes';
import Entradas from '../components/views/Entradas/Entradas';
import Productos from '../components/views/Insumos/Productos';
import Platos from '../components/views/Platos/Platos';
import Proveedores from '../components/views/Proveedores';
import Reportes from '../components/views/Reportes';
import Salidas from '../components/views/Salidas';
import Usuarios from '../components/views/Usuarios';
import { AuthContext, AuthProvider } from '../src/AuthContext';
import HomeScreen from './views/HomeScreen';
import LoadingApp from './views/LoadingApp';
import LoginScreen from './views/LoginScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    const { width } = useWindowDimensions();
    const isLandscape = width > 600; // Considera landscape si el ancho es mayor a 600px
    return (
        <SafeAreaView style={[styles.container, isLandscape && styles.containerLandscape]}>
            <Drawer.Navigator
                screenOptions={{ headerShown: false }}
                drawerContent={(props) => <CustomDrawerContent {...props} />}
            >
                <Drawer.Screen name="Home" component={HomeScreen} />
                <Drawer.Screen name="Insumos" component={Productos} />
                <Drawer.Screen name="Platos" component={Platos} />
                <Drawer.Screen name="Establecimientos" component={Almacenes} />
                <Drawer.Screen name="Salidas" component={Salidas} />
                <Drawer.Screen name="Entradas" component={Entradas} />
                <Drawer.Screen name="Proveedores" component={Proveedores} />
                <Drawer.Screen name="Usuarios" component={Usuarios} />
                <Drawer.Screen name="Reportes" component={Reportes} />
            </Drawer.Navigator>
        </SafeAreaView>
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

const App = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerLandscape: {
        flexDirection: 'row', // En landscape, los elementos estarán en fila
    },
    drawerContainer: {
        width: 250, // Ancho fijo del Drawer cuando está en landscape
        backgroundColor: '#f5f5f5',
    },
    screenContainer: {
        flex: 1, // Ocupa todo el espacio restante
    },
});

export default App;