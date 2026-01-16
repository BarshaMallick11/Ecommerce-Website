// frontend/src/components/CategoryGrid.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryCard from './CategoryCard';
import { Typography, Spin } from 'antd';

const { Title } = Typography;

const CategoryGrid = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="category-section" style={{ marginBottom: '24px' }}>
            <Title
                level={5}
                style={{
                    marginBottom: '16px',
                    color: '#111827',
                    fontSize: '16px',
                    fontWeight: '600'
                }}
            >
                You might like these
            </Title>
            <div
                className="category-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                }}
            >
                {categories.map((category) => (
                    <CategoryCard key={category._id} category={category} />
                ))}
            </div>
        </div>
    );
};

export default CategoryGrid;
