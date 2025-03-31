import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Dropdown = ({ data, selectedValue, onSelect }) => {
    const [visible, setVisible] = useState(false);

    const handleSelect = (item) => {
        onSelect(item);
        setVisible(false);
    };

    return (
        <View>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisible(true)}>
                <Text style={styles.dropdownText}>{selectedValue?.nombre || "Seleccionar almacén"}</Text>
                <Ionicons name="chevron-down" size={20} color="black" />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={styles.dropdownContainer}>
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
                                    <Text style={styles.itemText}>{item.nombre}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
    },
    dropdownText: {
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    dropdownContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    itemText: {
        fontSize: 16,
    },
});

export default Dropdown;