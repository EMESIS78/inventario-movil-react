import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

interface DropdownItem {
    label: string;
    value: string | number;
}

interface CustomDropdownProps {
    label?: string;
    data: DropdownItem[];
    selectedValue: string | number | null;
    onSelect: (value: string | number) => void;
    placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    label,
    data,
    selectedValue,
    onSelect,
    placeholder = 'Selecciona una opción'
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value: string | number) => {
        onSelect(value);
        setIsOpen(false);
    };

    const selectedLabel = data.find(item => item.value === selectedValue)?.label;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity style={styles.dropdown} onPress={() => setIsOpen(!isOpen)}>
                <Text style={{ color: selectedValue ? '#000' : '#999' }}>
                    {selectedLabel || placeholder}
                </Text>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.dropdownList}>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.value.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => handleSelect(item.value)}
                            >
                                <Text>{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f5f5f5'
    },
    dropdownList: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        maxHeight: 150,
        marginTop: 5
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    }
});

export default CustomDropdown;