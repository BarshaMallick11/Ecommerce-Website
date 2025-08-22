// frontend/src/components/ProductPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { Row, Col, Typography, Button, Spin, Image, message } from 'antd'; // Import message
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const { Title, Text } = Typography;

const ProductPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth(); // NEW: Get the current user status
    const navigate = useNavigate(); // NEW: Get the navigate function for redirection

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`http://localhost:5000/products/${id}`);
                setProduct(data);
            } catch (error) {
                console.error('Failed to fetch product', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // NEW: Updated logic for the "Add to Cart" button
    const handleAddToCart = () => {
        if (user) {
            // If user is logged in, add the item to the cart
            addToCart(product);
            message.success(`${product.name} added to cart`);
        } else {
            // If user is not logged in, show a message and redirect to the login page
            message.warning('Please log in to add items to your cart.');
            navigate('/login');
        }
    };

    if (loading) return <Spin size="large" />;
    if (!product) return <p>Product not found.</p>;

    return (
        <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
                <Image width="100%" src={product.image} alt={product.name} />
            </Col>
            <Col xs={24} md={12}>
                <Title level={2}>{product.name}</Title>
                <Text strong style={{ fontSize: '24px' }}>₹{product.price.toFixed(2)}</Text>
                <Title level={4}>Description</Title>
                <Text>{product.description}</Text>
                <br />
                <Button type="primary" size="large" style={{ marginTop: '20px' }} onClick={handleAddToCart}>
                    Add to Cart
                </Button>
            </Col>
        </Row>
    );
};

export default ProductPage;