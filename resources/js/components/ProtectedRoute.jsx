import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ROUTE_NAMES } from '../utils/constants';

/**
 * ProtectedRoute: blocks children until Sanctum session has been validated once.
 */
export default function ProtectedRoute({ children }) {
    const location = useLocation();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const sessionChecked = useAuthStore((s) => s.sessionChecked);

    if (!sessionChecked) return children;

    if (!isAuthenticated) {
        return <Navigate to={ROUTE_NAMES.LOGIN} replace state={{ from: location.pathname }} />;
    }

    return children;
}
