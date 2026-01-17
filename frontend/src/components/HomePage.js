// frontend/src/components/HomePage.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryGrid from './CategoryGrid';
import BannerSlider from './BannerSlider';
import { useProductSearch } from '../hooks/useProductSearch';

const HomePage = () => {
    const [searchInput, setSearchInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();
    const { suggestions, fetchSuggestions, clearSuggestions } = useProductSearch();
    const searchRef = useRef(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search/${searchInput}`);
            setSearchInput('');
            setShowSuggestions(false);
            clearSuggestions();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (value.trim().length >= 2) {
            fetchSuggestions(value);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            clearSuggestions();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        navigate(`/search/${suggestion.value}`);
        setSearchInput('');
        setShowSuggestions(false);
        clearSuggestions();
    };

    return (
        <div className="homepage-container">
            {/* Mobile Search Interface - Hidden on Desktop */}
            <div className="mobile-search-interface">
                <form className="mobile-search-bar" onSubmit={handleSearchSubmit} ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Search for groceries, fruits, snacks…"
                        className="mobile-search-input"
                        value={searchInput}
                        onChange={handleInputChange}
                        onFocus={() => searchInput.trim().length >= 2 && setShowSuggestions(true)}
                    />
                    <button type="submit" className="mobile-search-icon-btn">
                        <svg className="mobile-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="mobile-search-suggestions">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="mobile-search-suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <svg className="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                    <span>{suggestion.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </form>
            </div>

            {/* Homepage Content - Shows on BOTH Mobile and Desktop */}
            <div className="homepage-content">
                {/* Banner Slider */}
                <div className="homepage-banner-section">
                    <BannerSlider />
                </div>

                {/* Category Grid */}
                <div className="homepage-category-section">
                    <CategoryGrid />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
