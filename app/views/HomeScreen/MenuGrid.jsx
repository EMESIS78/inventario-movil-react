import React from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MenuGrid = ({ menuItems, cardSize, navigation }) => (
    <ScrollView contentContainerStyle={styles.grid}>
        {menuItems.map(item => (
            <Pressable
                key={item.route}
                style={[styles.card, { width: cardSize, height: cardSize }]}
                onPress={() => navigation.navigate(item.route)}
            >
                <MaterialIcons name={item.icon} size={40} color="#0F172A" />
                <Text style={styles.cardText}>{item.name}</Text>
            </Pressable>
        ))}
    </ScrollView>
);

export default MenuGrid;

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 60,
    },
    card: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
    },
});
