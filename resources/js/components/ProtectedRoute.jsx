import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ROUTE_NAMES } from '../utils/constants';
import Loader from './Loader';

/**
 * ProtectedRoute: blocks children until Sanctum session has been validated once.
 */
export default function ProtectedRoute({ children }) {
    const location = useLocation();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const sessionChecked = useAuthStore((s) => s.sessionChecked);

    if (!sessionChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader label="Checking access..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTE_NAMES.LOGIN} replace state={{ from: location.pathname }} />;
    }

    return children;
}
