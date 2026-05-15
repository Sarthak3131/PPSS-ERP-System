import {
    ArchiveBoxIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    CubeIcon,
    HomeIcon,
    QueueListIcon,
    RectangleStackIcon,
    ScaleIcon,
    Squares2X2Icon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { ROUTE_NAMES } from './constants';

export const navigationItems = [
    {
        name: 'Dashboard',
        path: ROUTE_NAMES.DASHBOARD,
        icon: HomeIcon,
        exact: true,
    },
    {
        name: 'Products',
        path: ROUTE_NAMES.PRODUCTS,
        icon: CubeIcon,
    },
    {
        name: 'Sizes',
        path: ROUTE_NAMES.SIZES,
        icon: ScaleIcon,
    },
    {
        name: 'BOM',
        path: ROUTE_NAMES.BOM,
        icon: RectangleStackIcon,
    },
    {
        name: 'Production Orders',
        path: ROUTE_NAMES.PRODUCTION_ORDERS,
        icon: QueueListIcon,
    },
    {
        name: 'Machine Planning',
        path: ROUTE_NAMES.MACHINE_PLANNING,
        icon: WrenchScrewdriverIcon,
    },
    {
        name: 'Scheduling Board',
        path: ROUTE_NAMES.SCHEDULING_BOARD,
        icon: Squares2X2Icon,
    },
    {
        name: 'Inventory',
        path: ROUTE_NAMES.INVENTORY,
        icon: ArchiveBoxIcon,
    },
    {
        name: 'Reports',
        path: ROUTE_NAMES.REPORTS,
        icon: ChartBarIcon,
    },
    {
        name: 'Settings',
        path: ROUTE_NAMES.SETTINGS,
        icon: Cog6ToothIcon,
    },
];

export const getNavigationItem = (path) => {
    return navigationItems.find((item) => item.path === path);
};

export const isNavigationPath = (path) => {
    return navigationItems.some((item) => item.path === path);
};
