// frontend/src/components/Product.js

import React, { useState } from 'react';
import { Card, Button, Typography, message, Rate } from 'antd';
import { ShoppingCartOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

const Product = ({ product }) => {
    const { cartItems, addToCart, decreaseQuantity: decreaseCartQuantity } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Find if this product is in the cart
    const cartItem = cartItems.find(item => item._id === product._id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    const handlePlusClick = () => {
        if (!user) {
            message.warning('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    const increaseQuantity = () => {
        addToCart(product);
    };

    const decreaseQuantity = () => {
        decreaseCartQuantity(product._id);
    };

    return (
        <Card
            hoverable
            style={{
                width: '100%',
                border: 'none',
                backgroundColor: '#fff',
                borderRadius: '16px',
                overflow: 'visible',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
            cover={
                <div className="product-card-cover">
                    <Link to={`/product/${product._id}`} style={{ width: '100%', height: '100%' }}>
                        <img
                            alt={product.name}
                            src={product.image}
                        />
                    </Link>
                </div>
            }
            bodyStyle={{ padding: '16px' }}
        >
            {/* Product Title with Plus Button (inline on desktop, separate on mobile) */}
            <div className="product-header-section">
                {/* 1. Product Title */}
                <div style={{ marginBottom: '8px' }}>
                    <Link to={`/product/${product._id}`} className="product-title-link">
                        <Text
                            strong
                            style={{
                                fontSize: '16px',
                                display: 'block',
                                color: '#262626',
                                lineHeight: '1.4'
                            }}
                        >
                            {product.name}
                        </Text>
                    </Link>
                </div>

                {/* Plus Icon - Shows inline on desktop, separate on mobile */}
                {!user?.isAdmin && (
                    <div className="plus-icon-wrapper">
                        {currentQuantity === 0 ? (
                            // Plus Button
                            <Button
                                icon={<PlusOutlined />}
                                onClick={handlePlusClick}
                                shape="circle"
                                size="small"
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e8e8e8',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    color: '#1890ff'
                                }}
                            />
                        ) : (
                            // Quantity Controls
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '4px 8px',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e8e8e8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                height: '32px'
                            }}>
                                <Button
                                    icon={<MinusOutlined />}
                                    onClick={decreaseQuantity}
                                    size="small"
                                    shape="circle"
                                    style={{
                                        border: 'none',
                                        color: '#ff4d4f',
                                        fontSize: '10px',
                                        width: '20px',
                                        height: '20px',
                                        minWidth: '20px',
                                        padding: 0
                                    }}
                                />
                                <Text strong style={{ fontSize: '12px', minWidth: '12px', textAlign: 'center' }}>
                                    {currentQuantity}
                                </Text>
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={increaseQuantity}
                                    size="small"
                                    shape="circle"
                                    style={{
                                        border: 'none',
                                        color: '#1890ff',
                                        fontSize: '10px',
                                        width: '20px',
                                        height: '20px',
                                        minWidth: '20px',
                                        padding: 0
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Rating */}
            <div style={{ marginBottom: '8px' }}>
                <div>
                    <Rate
                        disabled
                        allowHalf
                        value={product.rating || 0}
                        style={{ fontSize: '10px' }}
                    />
                </div>
                <div style={{ marginTop: '2px' }}>
                    <Text type="secondary" style={{ fontSize: '9px' }}>
                        ({product.numReviews || 0} reviews)
                    </Text>
                </div>
            </div>

            {/* 3. Price & Add to Cart Button (Horizontal) */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                minHeight: '36px'
            }}>
                <Text
                    strong
                    style={{
                        fontSize: '18px',
                        color: '#262626',
                        whiteSpace: 'nowrap'
                    }}
                >
                    ₹{product.price.toFixed(0)}
                </Text>
            </div>
        </Card>
    );
};

export default Product;