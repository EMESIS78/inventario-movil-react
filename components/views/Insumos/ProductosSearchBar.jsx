import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const ProductosSearchBar = ({ value, onChange }) => (
    <TextInput
        style={styles.searchInput}
        placeholder="Buscar producto..."
        placeholderTextColor="#000000"
        value={value}
        onChangeText={onChange}
    />
);

const styles = StyleSheet.create({
    searchInput: {
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        fontSize: 15,
        color: '#111827',
    },
});

export default ProductosSearchBar;
