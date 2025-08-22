// frontend/src/context/CartContext.js
import React, { createContext, useState, useContext } from 'react';
import { message } from 'antd';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(item => item._id === product._id);
            if (itemExists) {
                message.success(`${product.name} quantity updated in cart!`);
                return prevItems.map(item =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            message.success(`${product.name} added to cart!`);
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
        message.info(`Item removed from cart!`);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};