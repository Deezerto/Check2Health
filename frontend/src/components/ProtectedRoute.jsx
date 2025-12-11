import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // While checking auth status (cookie), don't redirect yet.
        return <div className="loading-screen">Loading...</div>;
    }

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
        // Admin trying to access a non-admin page
        if (user.role === 'ADMIN') redirectPath = '/dashboard/staff';

        return <Navigate to={redirectPath} replace />;
    }

    // User is authenticated and has the required role, render the component
    return <Outlet />;
};

export default ProtectedRoute;
