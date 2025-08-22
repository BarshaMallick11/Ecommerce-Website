// frontend/src/components/Product.js

import React from 'react';
import { Card, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { Meta } = Card;
const { Text } = Typography;

const Product = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = () => {
        if (user) {
            addToCart(product);
            message.success(`${product.name} added to cart`);
        } else {
            message.warning('Please log in to add items to your cart.');
            navigate('/login');
        }
    };

    return (
        <Card
            hoverable
            style={{ width: '100%' }}
            cover={
                <div
                    style={{
                        height: 160, // CHANGED FROM 240 to 160
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Link to={`/product/${product._id}`} style={{ width: '100%', height: '100%' }}>
                        <img
                            alt={product.name}
                            src={product.image}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </Link>
                </div>
            }
        >
            <Meta
                title={<Link to={`/product/${product._id}`}>{product.name}</Link>}
                description={<Text strong>₹{product.price.toFixed(2)}</Text>}
            />
            <Button type="primary" style={{ marginTop: '10px', width: '100%' }} onClick={handleAddToCart}>
                Add to Cart
            </Button>
        </Card>
    );
};

export default Product;
// export default Product;