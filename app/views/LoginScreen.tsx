import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  useColorScheme
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../src/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack'; // Asegúrate que la ruta sea correcta

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const auth = useContext(AuthContext);
  const scheme = useColorScheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fondo2 = scheme === 'dark' ? '#121212' : '#f0f2f5';
  const fondo = scheme === 'dark' ? '#1e1e1e' : '#fff';
  const texto = scheme === 'dark' ? '#f1f1f1' : '#111';
  const inputBg = scheme === 'dark' ? '#2d2d2d' : '#f9f9f9';
  const inputBorder = scheme === 'dark' ? '#444' : '#ccc';
  const buttonColor = '#2563eb';
  const logo = scheme === 'dark'
        ? require('../../assets/images/logo4.png') // Asegúrate de que la ruta sea correcta
        : require('../../assets/images/logo3copy.png');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa el correo y la contraseña.');
      return;
    }

    try {
      await auth?.login(email, password);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: fondo2 }]}>
      <View style={[styles.card, { backgroundColor: fondo }]}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={[styles.cardTitle, { color: texto }]}>Iniciar Sesión</Text>
        <Text style={[styles.cardDescription, { color: texto }]}>
          Ingresa tu correo y contraseña para continuar
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: texto }]}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: texto }]}
            keyboardType="email-address"
            placeholder="Ej. usuario@email.com"
            placeholderTextColor={scheme === 'dark' ? '#999' : '#888'}
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { color: texto }]}>Contraseña</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: texto }]}
            secureTextEntry
            placeholder="Tu contraseña"
            placeholderTextColor={scheme === 'dark' ? '#999' : '#888'}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={[styles.button, { backgroundColor: buttonColor }]} onPress={handleLogin}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 200,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});