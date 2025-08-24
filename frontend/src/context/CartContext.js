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
                return prevItems.map(item =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
        message.success({ content: `${product.name} added to cart!`, key: 'addToCartMessage', duration: 2 });
    };

    const decreaseQuantity = (productId) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(item => item._id === productId);
            if (itemExists.quantity === 1) {
                // If quantity is 1, remove the item
                return prevItems.filter(item => item._id !== productId);
            } else {
                // Otherwise, decrease the quantity
                return prevItems.map(item =>
                    item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
                );
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
        message.info(`Item removed from cart!`);
    };

    const clearCart = () => {
        setCartItems([]);
    }

    const value = {
        cartItems,
        addToCart,
        decreaseQuantity, // Add this
        removeFromCart,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
