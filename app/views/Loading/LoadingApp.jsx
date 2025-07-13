import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoadingApp = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    let isMounted = true;

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Verificar login
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (isMounted) {
          if (token) {
            console.log('✅ Usuario logueado');
            navigation.replace('Home');
          } else {
            console.log('🔒 Usuario no logueado');
            navigation.replace('Login');
          }
        }
      } catch (error) {
        console.error('❌ Error al verificar sesión:', error);
        if (isMounted) {
          navigation.replace('Login');
        }
      }
    };

    const timeout = setTimeout(checkLoginStatus, 7000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../../assets/images/react-logo.png')}
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
