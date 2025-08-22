// frontend/src/components/AdminRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user } = useAuth();
    // Note: We also check if the user object is loaded before checking isAdmin
    return user && user.isAdmin ? <Outlet /> : <Navigate to="/login" />;
};

export default AdminRoute;