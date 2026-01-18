// frontend/src/context/CartContext.js
import React, { createContext, useState, useContext } from 'react';
import { message } from 'antd';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Helper to get unique cart item key (considering variants)
    const getCartItemKey = (product) => {
        if (product.selectedVariant) {
            return `${product._id}_${product.selectedVariant._id}`;
        }
        return product._id;
    };

    // Helper to find item in cart (considering variants)
    const findCartItem = (items, product) => {
        const key = getCartItemKey(product);
        return items.find(item => {
            const itemKey = getCartItemKey(item);
            return itemKey === key;
        });
    };

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const itemExists = findCartItem(prevItems, product);
            if (itemExists) {
                // Update quantity for existing item (same product + variant combination)
                return prevItems.map(item => {
                    const itemKey = getCartItemKey(item);
                    const productKey = getCartItemKey(product);
                    return itemKey === productKey ? { ...item, quantity: item.quantity + 1 } : item;
                });
            }
            // Add new item to cart
            return [...prevItems, { ...product, quantity: 1 }];
        });

        const variantInfo = product.selectedVariant ? ` (${product.selectedVariant.label})` : '';
        message.success({ content: `${product.name}${variantInfo} added to cart!`, key: 'addToCartMessage', duration: 2 });
    };

    const decreaseQuantity = (productId, variantId = null) => {
        setCartItems(prevItems => {
            // Find the item considering variant
            const itemExists = prevItems.find(item => {
                if (variantId) {
                    return item._id === productId && item.selectedVariant?._id === variantId;
                }
                return item._id === productId && !item.selectedVariant;
            });

            if (!itemExists) return prevItems;

            if (itemExists.quantity === 1) {
                // If quantity is 1, remove the item
                return prevItems.filter(item => {
                    if (variantId) {
                        return !(item._id === productId && item.selectedVariant?._id === variantId);
                    }
                    return !(item._id === productId && !item.selectedVariant);
                });
            } else {
                // Otherwise, decrease the quantity
                return prevItems.map(item => {
                    const isMatch = variantId
                        ? (item._id === productId && item.selectedVariant?._id === variantId)
                        : (item._id === productId && !item.selectedVariant);
                    return isMatch ? { ...item, quantity: item.quantity - 1 } : item;
                });
            }
        });
    };

    const removeFromCart = (productId, variantId = null) => {
        setCartItems(prevItems => prevItems.filter(item => {
            if (variantId) {
                return !(item._id === productId && item.selectedVariant?._id === variantId);
            }
            return !(item._id === productId && !item.selectedVariant);
        }));
        message.info(`Item removed from cart!`);
    };

    const clearCart = () => {
        setCartItems([]);
    }

    const value = {
        cartItems,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getCartItemKey // Export helper for components
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
