import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@env';

interface User {
    id: number;
    name: string;
    email: string;
    rol: string;
    almacen_id: number | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean; // Nuevo estado de carga
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                    const response = await axios.get(`${API_URL}/users/perfil`, {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    setUser(response.data);
                }else {
                    console.log('No hay token almacenado');
                    setUser(null);
                    setToken(null);
                }
            } catch (error) {
                console.error('Error al recuperar sesión:', error);
                setUser(null);
                setToken(null);
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = response.data;

            await AsyncStorage.setItem('token', token);
            setUser(user);
            setToken(token);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw new Error('Credenciales incorrectas');
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};