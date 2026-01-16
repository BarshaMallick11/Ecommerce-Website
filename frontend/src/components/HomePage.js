// frontend/src/components/HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryGrid from './CategoryGrid';
import BannerSlider from './BannerSlider';

const HomePage = () => {
    const [searchInput, setSearchInput] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search/${searchInput}`);
            setSearchInput('');
        }
    };

    return (
        <div className="homepage-container">
            {/* Mobile Search Interface - Hidden on Desktop */}
            <div className="mobile-search-interface">
                <form className="mobile-search-bar" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search for groceries, fruits, snacks…"
                        className="mobile-search-input"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="mobile-search-icon-btn">
                        <svg className="mobile-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
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
