import React from 'react';
import { CalendarDaysIcon, Cog6ToothIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import ActivityFeed from '../ActivityFeed';
import QuickActions from '../QuickActions';
import StatusBadge from '../StatusBadge';

const quickActions = [
    {
        label: 'Create Work Order',
        description: 'Open a new work order entry',
        href: '/production-orders',
        icon: DocumentPlusIcon,
    },
    {
        label: 'Allocate Machine',
        description: 'Assign load across active machines',
        href: '/machine-planning',
        icon: Cog6ToothIcon,
    },
    {
        label: 'Open Scheduling Board',
        description: 'Review the daily scheduling board',
        href: '/scheduling-board',
        icon: CalendarDaysIcon,
    },
];

function resourceCollectionLength(bucket) {
    if (!Array.isArray(bucket)) return 0;
    return bucket.length;
}

const DashboardSupportSection = React.memo(function DashboardSupportSection({ activities, summary, alerts }) {
    const overdueCount = summary?.overdue_orders ?? 0;
    const lowLen = resourceCollectionLength(alerts.low_stock);
    const critLen = resourceCollectionLength(alerts.critical_stock);
    const outLen = resourceCollectionLength(alerts.out_of_stock);

    return (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
            <ActivityFeed items={activities} />
            <QuickActions actions={quickActions} />

            <div className="xl:col-span-2 grid gap-4 lg:grid-cols-1">
                <section className="erp-panel">
                    <h3 className="text-sm font-semibold text-(--erp-ink)">Operational alerts</h3>
                    <div className="mt-2 space-y-2">
                        {overdueCount > 0 && (
                            <div className="erp-subpanel flex items-center justify-between">
                                <span className="text-xs text-(--erp-muted)">{overdueCount} overdue production orders (due date passed)</span>
                                <StatusBadge status="Pending" />
                            </div>
                        )}
                        {critLen > 0 && (
                            <div className="erp-subpanel flex items-center justify-between">
                                <span className="text-xs text-(--erp-muted)">{critLen} critical stock items</span>
                                <StatusBadge status="Low Stock" />
                            </div>
                        )}
                        {outLen > 0 && (
                            <div className="erp-subpanel flex items-center justify-between">
                                <span className="text-xs text-(--erp-muted)">{outLen} out of stock items</span>
                                <StatusBadge status="Out of Stock" />
                            </div>
                        )}
                        {lowLen > 0 && (
                            <div className="erp-subpanel flex items-center justify-between">
                                <span className="text-xs text-(--erp-muted)">{lowLen} low stock materials</span>
                                <StatusBadge status="Scheduled" />
                            </div>
                        )}
                        {overdueCount === 0 && critLen === 0 && outLen === 0 && lowLen === 0 && (
                            <div className="erp-subpanel flex items-center justify-center py-4">
                                <span className="text-xs text-(--erp-muted)">No alerts</span>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
});

export default DashboardSupportSection;
