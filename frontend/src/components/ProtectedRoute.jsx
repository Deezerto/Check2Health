import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const rawUser = sessionStorage.getItem('auth.user');
    const user = rawUser ? JSON.parse(rawUser) : null;

    if (!user) {
        // Not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in, but does not have the required role
        // Redirect to a default page (e.g., their own dashboard)
        let redirectPath = '/login';
        if (user.role === 'PATIENT') redirectPath = '/dashboard/patient';
        if (user.role === 'DOCTOR') redirectPath = '/dashboard/doctor';
        if (user.role === 'STAFF') redirectPath = '/dashboard/staff';
        // Admin trying to access a non-admin page would be handled by route definition
        // But if they somehow land here, send them to their dashboard.
        if (user.role === 'ADMIN') redirectPath = '/dashboard/staff';
        
        return <Navigate to={redirectPath} replace />;
    }

    // User is authenticated and has the required role, render the component
    return <Outlet />;
};

export default ProtectedRoute;
