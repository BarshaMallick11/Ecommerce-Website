// frontend/src/components/CartIcon.js
import React from 'react';
import { Badge } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartIcon = () => {
    const { cartItems } = useCart();
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <Link to="/cart">
            <Badge count={itemCount}>
                <ShoppingCartOutlined className="cart-icon" style={{ fontSize: '24px', color: 'white' }} />
            </Badge>
        </Link>
    );
};

export default CartIcon;
