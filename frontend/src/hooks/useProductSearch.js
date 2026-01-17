// frontend/src/hooks/useProductSearch.js
import { useState } from 'react';
import axios from 'axios';

export const useProductSearch = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSuggestions = async (query) => {
        if (!query || query.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API_URL}/products/autocomplete?query=${query}`
            );
            setSuggestions(data);
        } catch (error) {
            console.error('Autocomplete search failed:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const clearSuggestions = () => {
        setSuggestions([]);
    };

    return {
        suggestions,
        loading,
        fetchSuggestions,
        clearSuggestions
    };
};
