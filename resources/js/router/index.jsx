import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Sizes from '../pages/Sizes';
import BOM from '../pages/BOM';
import ProductionOrders from '../pages/ProductionOrders';
import MachinePlanning from '../pages/MachinePlanning';
import SchedulingBoard from '../pages/SchedulingBoard';
import Inventory from '../pages/Inventory';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import { ROUTE_NAMES } from '../utils/constants';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to={ROUTE_NAMES.DASHBOARD} replace />,
    },
    {
        element: <ErrorBoundary><AuthLayout /></ErrorBoundary>,
        children: [
            {
                path: ROUTE_NAMES.LOGIN,
                element: (
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                ),
            },
            {
                path: ROUTE_NAMES.REGISTER,
                element: (
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                ),
            },
        ],
    },
    {
        element: <ErrorBoundary><DashboardLayout /></ErrorBoundary>,
        children: [
            {
                path: ROUTE_NAMES.DASHBOARD,
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.PRODUCTS,
                element: (
                    <ProtectedRoute>
                        <Products />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.SIZES,
                element: (
                    <ProtectedRoute>
                        <Sizes />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.BOM,
                element: (
                    <ProtectedRoute>
                        <BOM />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.PRODUCTION_ORDERS,
                element: (
                    <ProtectedRoute>
                        <ProductionOrders />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.MACHINE_PLANNING,
                element: (
                    <ProtectedRoute>
                        <MachinePlanning />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.SCHEDULING_BOARD,
                element: (
                    <ProtectedRoute>
                        <SchedulingBoard />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.INVENTORY,
                element: (
                    <ProtectedRoute>
                        <Inventory />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.REPORTS,
                element: (
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                ),
            },
            {
                path: ROUTE_NAMES.SETTINGS,
                element: (
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: ROUTE_NAMES.NOT_FOUND,
        element: <NotFound />,
    },
    {
        path: '*',
        element: <Navigate to={ROUTE_NAMES.NOT_FOUND} replace />,
    },
]);

export default router;
