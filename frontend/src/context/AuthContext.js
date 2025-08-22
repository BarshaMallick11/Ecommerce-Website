// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
//import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            // You might want to verify the token with the backend here
            // For simplicity, we'll just decode it or fetch user data
            const storedUser = localStorage.getItem('user');
            if(storedUser) setUser(JSON.parse(storedUser));
        }
    }, [token]);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = { user, token, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};