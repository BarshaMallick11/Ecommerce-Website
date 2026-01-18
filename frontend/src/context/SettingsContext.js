// frontend/src/context/SettingsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        // Default values
        deliveryCharge: 40,
        freeDeliveryThreshold: 399,
        deliveryChargeEnabled: true,
        maxQuantityPerProduct: 5,
        orderLimitEnabled: true,
        upiEnabled: true,
        upiId: '',
        upiQrCodeUrl: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`);
                setSettings({
                    deliveryCharge: data.deliveryCharge || 40,
                    freeDeliveryThreshold: data.freeDeliveryThreshold || 399,
                    deliveryChargeEnabled: data.deliveryChargeEnabled !== false,
                    maxQuantityPerProduct: data.maxQuantityPerProduct || 5,
                    orderLimitEnabled: data.orderLimitEnabled !== false,
                    upiEnabled: data.upiEnabled !== false,
                    upiId: data.upiId || '',
                    upiQrCodeUrl: data.upiQrCodeUrl || ''
                });
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Helper function to get effective max quantity
    const getMaxQuantity = (stockAvailable) => {
        if (!settings.orderLimitEnabled) {
            return stockAvailable; // No limit, use stock as limit
        }
        return Math.min(settings.maxQuantityPerProduct, stockAvailable);
    };

    // Helper function to check if quantity can be increased
    const canIncreaseQuantity = (currentQuantity, stockAvailable) => {
        const maxAllowed = getMaxQuantity(stockAvailable);
        return currentQuantity < maxAllowed;
    };

    const value = {
        settings,
        loading,
        getMaxQuantity,
        canIncreaseQuantity
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
