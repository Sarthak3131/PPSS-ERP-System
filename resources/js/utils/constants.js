export const APP_NAME = 'PPSS ERP';
export const APP_TAGLINE = 'Planning Console';

export const API_BASE_URL = '/api';

export const ROUTE_NAMES = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PRODUCTS: '/products',
    SIZES: '/sizes',
    BOM: '/bom',
    PRODUCTION_ORDERS: '/production-orders',
    MACHINE_PLANNING: '/machine-planning',
    SCHEDULING_BOARD: '/scheduling-board',
    INVENTORY: '/inventory',
    REPORTS: '/reports',
    SETTINGS: '/settings',
    NOT_FOUND: '/not-found',
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'ppss_auth_token',
    USER_SESSION: 'ppss_user_session',
    ACTIVE_PLANT: 'ppss_active_plant',
    THEME: 'ppss_theme',
    SIDEBAR_COLLAPSED: 'ppss_sidebar_collapsed',
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
};
