export const ORDER_STATUS = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

export const INVENTORY_STATUS = {
    IN_STOCK: 'In Stock',
    LOW: 'Low',
    OUT: 'Out',
};

export const statusStyles = {
    Pending: 'bg-amber-50 text-amber-700 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/40',
    'In Progress': 'bg-sky-50 text-sky-700 ring-sky-300 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/40',
    Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/40',
    Draft: 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-700/60 dark:text-slate-200 dark:ring-slate-600',
    Released: 'bg-indigo-50 text-indigo-700 ring-indigo-300 dark:bg-indigo-500/15 dark:text-indigo-200 dark:ring-indigo-500/40',
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/40',
    Idle: 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-700/60 dark:text-slate-200 dark:ring-slate-600',
    Cancelled: 'bg-rose-50 text-rose-700 ring-rose-300 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/40',
};
