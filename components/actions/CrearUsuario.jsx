import React, { useState, useContext } from 'react';
import {
    View, Text, Modal, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '@/src/AuthContext';
import CustomDropdown from '../customs/CustomDropdown';

const CrearUsuario = ({ visible, onClose, onSuccess }) => {
    const { token } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rol: '',
        almacen_id: null,
    });

    const roles = [
        { label: 'Supervisor', value: 'supervisor' },
        { label: 'Usuario', value: 'usuario' },
    ];

    const almacenes = [
        { label: 'LA CACHIMBA', value: 1 },
        { label: 'SAN IGNACIO', value: 2 },
    ];

    const handleChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleCreate = async () => {
        try {
            await axios.post(`${API_URL}/usuarios`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al crear usuario:', err);
        }
    };

    return (
        <Modal visible={visible} animationType="slide">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Registrar Nuevo Usuario</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre completo"
                            value={formData.name}
                            placeholderTextColor="#000000"
                            onChangeText={text => handleChange('name', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            value={formData.email}
                            placeholderTextColor="#000000"
                            keyboardType="email-address"
                            onChangeText={text => handleChange('email', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            value={formData.password}
                            placeholderTextColor="#000000"
                            secureTextEntry
                            onChangeText={text => handleChange('password', text)}
                        />

                        <CustomDropdown
                            label="Rol"
                            data={roles}
                            selectedValue={formData.rol}
                            onSelect={(value) => handleChange('rol', value)}
                        />

                        <CustomDropdown
                            label="Almacén"
                            data={almacenes}
                            selectedValue={formData.almacen_id}
                            onSelect={(value) => handleChange('almacen_id', value)}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleCreate}>
                            <Text style={styles.buttonText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CrearUsuario;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f0f2f5',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f9f9f9',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    cancelText: {
        textAlign: 'center',
        marginTop: 18,
        color: '#888',
        fontSize: 15,
    },
});