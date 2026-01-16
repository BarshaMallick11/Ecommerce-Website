// frontend/src/components/CategoryCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';

const { Text } = Typography;

const CategoryCard = ({ category }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/products/${category.slug}`);
    };

    return (
        <div
            className="category-card"
            onClick={handleClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px'
            }}
        >
            <div
                className="category-image-wrapper"
                style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease'
                }}
            >
                <img
                    src={category.image}
                    alt={category.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/70?text=' + category.name.charAt(0);
                    }}
                />
            </div>
            <Text
                strong
                style={{
                    fontSize: '12px',
                    textAlign: 'center',
                    color: '#374151'
                }}
            >
                {category.name}
            </Text>
        </div>
    );
};

export default CategoryCard;
