import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const EntradasSearchBar = ({ value, onChange }) => (
    <TextInput
        style={styles.input}
        placeholder="Buscar por documento o almacén"
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChange}
    />
);

const styles = StyleSheet.create({
    input: {
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
});

export default EntradasSearchBar;
