import React from 'react';
import { FlatList, useWindowDimensions } from 'react-native';
import ProductoCard from './ProductoCard';

const ProductoList = ({ productos, search, onEdit, onDelete }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const numColumns = isLandscape ? 3 : 1;

    const productosFiltrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <FlatList
            key={`flatlist-${numColumns}`}
            data={productosFiltrados}
            keyExtractor={(item) => item.id_producto.toString()}
            numColumns={numColumns}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
                <ProductoCard
                    producto={item}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                />
            )}
        />
    );
};

export default ProductoList;
