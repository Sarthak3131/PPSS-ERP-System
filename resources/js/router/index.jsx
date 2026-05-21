import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import { ROUTE_NAMES } from '../utils/constants';
import { getRouteLoader } from './routeLoaders';

const lazyRoute = (path) => lazy(getRouteLoader(path));

const Login = lazyRoute(ROUTE_NAMES.LOGIN);
const Register = lazyRoute(ROUTE_NAMES.REGISTER);
const Dashboard = lazyRoute(ROUTE_NAMES.DASHBOARD);
const Products = lazyRoute(ROUTE_NAMES.PRODUCTS);
const Sizes = lazyRoute(ROUTE_NAMES.SIZES);
const BOM = lazyRoute(ROUTE_NAMES.BOM);
const ProductionOrders = lazyRoute(ROUTE_NAMES.PRODUCTION_ORDERS);
const MachinePlanning = lazyRoute(ROUTE_NAMES.MACHINE_PLANNING);
const SchedulingBoard = lazyRoute(ROUTE_NAMES.SCHEDULING_BOARD);
const Inventory = lazyRoute(ROUTE_NAMES.INVENTORY);
const Reports = lazyRoute(ROUTE_NAMES.REPORTS);
const Settings = lazyRoute(ROUTE_NAMES.SETTINGS);
const NotFound = lazyRoute(ROUTE_NAMES.NOT_FOUND);

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
