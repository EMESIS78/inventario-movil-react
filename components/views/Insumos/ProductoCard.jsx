import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductoCard = ({ producto, onEdit, onDelete }) => (
    <View style={styles.card}>
        <View style={styles.cardContent}>
            <Text style={styles.productName}>{producto.nombre}</Text>
            <Text style={styles.productDescription}>{producto.marca}</Text>
            <Text style={styles.productPrice}>Unidad: {producto.unidad_medida}</Text>
            <Text style={styles.productStock}>Stock: {producto.stock}</Text>
        </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                <Ionicons name="create-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginVertical: 6,
        padding: 16,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    cardContent: {
        gap: 4,
    },
    productName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2,
    },
    productDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 14,
        color: '#007bff',
    },
    productStock: {
        fontSize: 14,
        color: '#16a34a',
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
    },
    editButton: {
        backgroundColor: '#3b82f6',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
});

export default ProductoCard;
