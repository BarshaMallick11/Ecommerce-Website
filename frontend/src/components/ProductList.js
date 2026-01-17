// frontend/src/components/ProductList.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Row, Col, Spin, Typography } from 'antd';
import Product from './Product';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { useProductSearch } from '../hooks/useProductSearch';

const { Title } = Typography;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [categoryDetails, setCategoryDetails] = useState(null);
    const { keyword, categorySlug } = useParams();
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

    useEffect(() => {
        const fetchCategoryAndProducts = async () => {
            setLoading(true);
            try {
                // If we have a category slug, fetch category details
                if (categorySlug) {
                    const { data: categoryData } = await axios.get(
                        `${process.env.REACT_APP_API_URL}/api/categories/${categorySlug}`
                    );
                    setCategoryDetails(categoryData);
                }

                // Build products URL
                let url = '/products';
                const params = [];

                if (keyword) params.push(`keyword=${keyword}`);
                if (categorySlug) params.push(`category=${categorySlug}`);

                if (params.length > 0) {
                    url += `?${params.join('&')}`;
                }

                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}${url}`);
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryAndProducts();
    }, [keyword, categorySlug]);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
    }

    return (
        <div>
            {(keyword || categorySlug) && <BackButton />}

            {/* Desktop Title - Hidden on mobile */}
            <Title level={2} className="desktop-product-title" style={{ textAlign: 'center', margin: '40px 0' }}>
                {keyword ? `Search Results for "${keyword}"` : categoryDetails ? categoryDetails.name : 'Our Products'}
            </Title>

            {/* Mobile Search Interface - Hidden on desktop */}
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

                {/* Mobile category title */}
                {categoryDetails && (
                    <div style={{ padding: '16px', paddingBottom: '8px' }}>
                        <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                            {categoryDetails.name}
                        </Title>
                        {categoryDetails.description && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                                {categoryDetails.description}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="product-list-container">
                <Row gutter={[24, 24]} justify="start">
                    {products.length > 0 ? products.map(product => (
                        <Col key={product._id} xs={12} sm={12} md={8} lg={6}>
                            <Product product={product} />
                        </Col>
                    )) : (
                        <Col span={24} style={{ textAlign: 'center' }}>
                            <Title level={4}>No products found.</Title>
                        </Col>
                    )}
                </Row>
            </div>
        </div>
    );
};

export default ProductList;
