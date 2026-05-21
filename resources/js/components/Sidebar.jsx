import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '../utils/navigation';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';
import { preloadRoute } from '../router/routeLoaders';

const Sidebar = React.memo(function Sidebar({ closeSidebar }) {
    return (
        <div className="flex h-full w-64 flex-col border-r border-(--erp-border) bg-(--erp-surface) p-3 text-(--erp-ink) shadow-[12px_0_40px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-start justify-between gap-2 rounded-lg border border-(--erp-border) bg-(--erp-surface-muted) px-3 py-2">
                <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-(--erp-muted)">{APP_NAME}</p>
                    <h1 className="text-base font-semibold text-(--erp-ink)">{APP_TAGLINE}</h1>
                </div>

                {closeSidebar ? (
                    <button
                        type="button"
                        onClick={closeSidebar}
                        className="rounded-md p-1 text-(--erp-muted) transition hover:bg-(--erp-surface-muted) hover:text-(--erp-ink) lg:hidden"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                ) : null}
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5">
                {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact ?? false}
                            onClick={() => closeSidebar?.()}
                            onMouseEnter={() => preloadRoute(item.path)}
                            onFocus={() => preloadRoute(item.path)}
                            className={({ isActive }) =>
                                [
                                        'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-(--erp-surface-muted) text-(--erp-primary) shadow-sm ring-1 ring-(--erp-border) before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r before:bg-(--erp-primary)'
                                            : 'text-(--erp-muted) hover:bg-(--erp-surface-muted) hover:text-(--erp-ink)',
                                ].join(' ')
                            }
                        >
                            <span className="rounded-md p-1 ring-1 ring-transparent group-hover:ring-(--erp-border)">
                                <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
                            </span>
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
    });

    export default Sidebar;
