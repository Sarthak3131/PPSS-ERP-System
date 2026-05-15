import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ROUTE_NAMES } from '../utils/constants';

/**
 * PublicRoute: Structural wrapper for public routes (login, etc.).
 * Redirects authenticated users to dashboard.
 */
export default function PublicRoute({ children }) {
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();
    const redirectTo = location.state?.from || ROUTE_NAMES.DASHBOARD;

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}
