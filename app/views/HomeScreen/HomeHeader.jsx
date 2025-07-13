import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const HomeHeader = ({ user, notifications, onOpenNotifications }) => (
    <View style={styles.header}>
        <Text style={styles.title}>Bienvenido, {user?.name || 'Usuario'}</Text>
        {user?.rol === 'admin' && (
            <TouchableOpacity onPress={onOpenNotifications} style={styles.bell}>
                <MaterialIcons name="notifications" size={24} color="#0F172A" />
                {notifications.length > 0 && (
                    <Animatable.View
                        animation="pulse"
                        iterationCount="infinite"
                        style={styles.dot}
                    />
                )}
            </TouchableOpacity>
        )}
    </View>
);

export default HomeHeader;

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
    },
    bell: {
        marginTop: 8,
    },
    dot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
    },
});
