// frontend/src/components/SearchBox.js
import React, { useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchBox = () => {
    const navigate = useNavigate();
    const [options, setOptions] = useState([]);

    const handleSearch = async (value) => {
        if (value) {
            try {
                const { data } = await axios.get(`http://localhost:5000/products/autocomplete?query=${value}`);
                setOptions(data);
            } catch (error) {
                console.error("Autocomplete search failed", error);
                setOptions([]);
            }
        } else {
            setOptions([]);
        }
    };

    const onSelect = (value) => {
        navigate(`/search/${value}`);
    };

    return (
        <AutoComplete
            options={options}
            style={{ width: 300 }}
            onSelect={onSelect}
            onSearch={handleSearch}
        >
            <Input.Search
                placeholder="Search products..."
                enterButton
                onSearch={(value) => onSelect(value)} // Handle pressing enter
            />
        </AutoComplete>
    );
};

export default SearchBox;