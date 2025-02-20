import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  LoadingApp: undefined;
  Home: undefined;
  Login: undefined;
};

const LoadingApp = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let isMounted = true; // Control para evitar cambios en componentes desmontados

    // Animación de entrada (fade in)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Verificar token y redirigir
    const checkLoginStatus = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (isMounted) {
          if (storedToken) {
            console.log('Usuario logueado');
            navigation.replace('Home');
          } else {
            console.log('Usuario no logueado');
            navigation.replace('Login');
          }
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        if (isMounted) {
          navigation.replace('Login');
        }
      }
    };

    setTimeout(checkLoginStatus, 7000);

    return () => {
      isMounted = false; // Evita cambios en estado si el componente se desmonta
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/react-logo.png')}
        style={[styles.logo, { opacity: fadeAnim }]}
      />
    </View>
  );
};

export default LoadingApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
  },
});