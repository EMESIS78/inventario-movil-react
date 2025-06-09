import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    Pressable,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomDropdown = ({ label, data, selectedValue, onSelect }) => {
    const [isVisible, setIsVisible] = useState(false);
    const rotateAnim = useState(new Animated.Value(0))[0];

    const toggleDropdown = () => {
        Animated.timing(rotateAnim, {
            toValue: isVisible ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
        setIsVisible(!isVisible);
    };

    const handleSelect = (value) => {
        onSelect(value);
        toggleDropdown();
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleDropdown}
                activeOpacity={0.9}
            >
                <Text style={styles.dropdownText}>
                    {data.find(item => item.value === selectedValue)?.label || 'Seleccionar'}
                </Text>
                <Animated.View style={{ transform: [{ rotate }] }}>
                    <Ionicons name="chevron-down" size={18} color="#444" />
                </Animated.View>
            </TouchableOpacity>

            <Modal visible={isVisible} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={toggleDropdown}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.value.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={styles.optionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default CustomDropdown;

const styles = StyleSheet.create({
    container: {
        marginBottom: 18,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 6,
        fontWeight: '500',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 1,
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 8,
        maxHeight: '50%',
        elevation: 5,
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
});
