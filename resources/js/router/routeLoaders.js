import { ROUTE_NAMES } from '../utils/constants';

const routeLoaders = {
    [ROUTE_NAMES.LOGIN]: () => import('../pages/Login'),
    [ROUTE_NAMES.REGISTER]: () => import('../pages/Register'),
    [ROUTE_NAMES.DASHBOARD]: () => import('../pages/Dashboard'),
    [ROUTE_NAMES.PRODUCTS]: () => import('../pages/Products'),
    [ROUTE_NAMES.SIZES]: () => import('../pages/Sizes'),
    [ROUTE_NAMES.BOM]: () => import('../pages/BOM'),
    [ROUTE_NAMES.PRODUCTION_ORDERS]: () => import('../pages/ProductionOrders'),
    [ROUTE_NAMES.MACHINE_PLANNING]: () => import('../pages/MachinePlanning'),
    [ROUTE_NAMES.SCHEDULING_BOARD]: () => import('../pages/SchedulingBoard'),
    [ROUTE_NAMES.INVENTORY]: () => import('../pages/Inventory'),
    [ROUTE_NAMES.REPORTS]: () => import('../pages/Reports'),
    [ROUTE_NAMES.SETTINGS]: () => import('../pages/Settings'),
    [ROUTE_NAMES.NOT_FOUND]: () => import('../pages/NotFound'),
};

const preloadCache = new Map();

export function preloadRoute(path) {
    const loader = routeLoaders[path];
    if (!loader) return Promise.resolve(null);

    if (!preloadCache.has(path)) {
        preloadCache.set(path, loader());
    }

    return preloadCache.get(path);
}

export function getRouteLoader(path) {
    return routeLoaders[path] || null;
}
