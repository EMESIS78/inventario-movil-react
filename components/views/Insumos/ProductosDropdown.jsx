import React from 'react';
import Dropdown from '../../customs/Dropdown';

const ProductosDropdown = ({ almacenes, selected, onSelect }) => {
    return (
        <Dropdown
            data={almacenes}
            selectedValue={selected}
            onSelect={onSelect}
        />
    );
};

export default ProductosDropdown;
