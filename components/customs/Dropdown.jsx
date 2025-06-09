import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const Dropdown = ({ data, selectedValue, onSelect }) => {
    const [visible, setVisible] = useState(false);

    const handleSelect = (item) => {
        onSelect(item);
        setVisible(false);
    };

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisible(true)}>
                <Text style={styles.dropdownText}>
                    {selectedValue?.nombre || 'Seleccionar almacén'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                    activeOpacity={1}
                    onPressOut={() => setVisible(false)}
                    style={styles.overlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecciona un almacén</Text>
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={styles.itemText}>{item.nombre}</Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 20,
        marginTop: 10,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        elevation: 2,
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: screenWidth * 0.85,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    item: {
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    itemText: {
        fontSize: 16,
        color: '#444',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
});

export default Dropdown;