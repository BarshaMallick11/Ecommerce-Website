// frontend/src/components/CartIcon.js
import React from 'react';
import { Badge, Space, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const { Text } = Typography;

const CartIcon = () => {
    const { cartItems } = useCart();
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <Link to="/cart" style={{ textDecoration: 'none' }}>
            <Space size={4} align="center" style={{ cursor: 'pointer' }}>
                <Badge
                    count={itemCount}
                    size="small"
                    style={{
                        backgroundColor: '#ff6b6b',
                        fontWeight: 'bold'
                    }}
                >
                    <ShoppingCartOutlined
                        style={{
                            fontSize: '20px',
                            color: 'white'
                        }}
                    />
                </Badge>
                <Text
                    style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    Cart
                </Text>
            </Space>
        </Link>
    );
};

export default CartIcon;
