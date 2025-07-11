import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { AuthContext } from '@/src/AuthContext';
import CustomDropdown from '../customs/CustomDropdown';

const EditarUsuario = ({ visible, usuario, onClose, onSuccess }) => {
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

    useEffect(() => {
        if (usuario) {
            setFormData({
                ...usuario,
                password: '',
            });
        }
    }, [usuario]);

    const handleChange = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`${API_URL}/usuarios/${usuario.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
        }
    };

    if (!usuario) return null;

    return (
        <Modal visible={visible} animationType="slide">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Editar Usuario</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre completo"
                            placeholderTextColor="#000000"
                            value={formData.name}
                            onChangeText={(text) => handleChange('name', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#000000"
                            value={formData.email}
                            keyboardType="email-address"
                            onChangeText={(text) => handleChange('email', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nueva contraseña (opcional)"
                            placeholderTextColor="#000000"
                            secureTextEntry
                            onChangeText={(text) => handleChange('password', text)}
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

                        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                            <Text style={styles.buttonText}>Guardar Cambios</Text>
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

export default EditarUsuario;

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