import React from 'react';
import { QueueListIcon, CubeIcon, CheckCircleIcon, Cog6ToothIcon, DocumentPlusIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import QuickActions from '../components/QuickActions';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatusBadge from '../components/StatusBadge';
import useAppStore from '../store/appStore';
import * as inventoryService from '../services/inventoryService';
import * as reportService from '../services/reportService';
import { useToast } from '../components/ui/ToastProvider';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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

const EMPTY_SUMMARY = {
    total_orders: 0,
    pending: 0,
    released: 0,
    completed: 0,
    overdue_orders: 0,
};

const EMPTY_ALERTS = {
    low_stock: [],
    critical_stock: [],
    out_of_stock: [],
};

export default function Dashboard() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isMounted, setIsMounted] = React.useState(false);
    const [summary, setSummary] = React.useState(null);
    const [trendRows, setTrendRows] = React.useState([]);
    const [machineBars, setMachineBars] = React.useState([]);
    const [alerts, setAlerts] = React.useState(EMPTY_ALERTS);

    const activities = useAppStore((s) => s.activities);
    const { push: pushToast } = useToast();

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [summaryRes, trendRowsRaw, utilRes, alertsEnvelope] = await Promise.all([
                reportService.productionSummary(),
                reportService.productionTrend(),
                reportService.machineUtilization(),
                inventoryService.alerts(),
            ]);
            setSummary(summaryRes);
            setTrendRows(Array.isArray(trendRowsRaw) ? trendRowsRaw : []);
            const bars = (Array.isArray(utilRes) ? utilRes : []).map((u) => ({
                machineName: u.machine?.name ?? '—',
                utilization: Number(u.utilization_percentage) || 0,
            }));
            setMachineBars(bars);
            const alertPayload = alertsEnvelope;
            setAlerts({
                low_stock: Array.isArray(alertPayload?.low_stock) ? alertPayload.low_stock : [],
                critical_stock: Array.isArray(alertPayload?.critical_stock) ? alertPayload.critical_stock : [],
                out_of_stock: Array.isArray(alertPayload?.out_of_stock) ? alertPayload.out_of_stock : [],
            });
        } catch (error) {
            setSummary(EMPTY_SUMMARY);
            setTrendRows([]);
            setMachineBars([]);
            setAlerts(EMPTY_ALERTS);
            pushToast({ title: 'Error', message: 'Failed to load dashboard data.', tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        setIsMounted(true);
        fetchDashboardData();
    }, []);

    const dynamicStats = summary
        ? [
              {
                  title: 'Total Orders',
                  value: String(summary.total_orders ?? 0),
                  hint: 'All production orders',
                  trend: 'From reports API',
                  icon: QueueListIcon,
              },
              {
                  title: 'Pending',
                  value: String(summary.pending ?? 0),
                  hint: 'Awaiting dispatch',
                  trend: 'From reports API',
                  icon: CubeIcon,
              },
              {
                  title: 'Released',
                  value: String(summary.released ?? 0),
                  hint: 'On the floor',
                  trend: 'From reports API',
                  icon: Cog6ToothIcon,
              },
              {
                  title: 'Completed',
                  value: String(summary.completed ?? 0),
                  hint: 'Finished',
                  trend: 'From reports API',
                  icon: CheckCircleIcon,
              },
          ]
        : [];

    const trendChartRows = trendRows;
    const machineChartRows = machineBars;

    const overdueCount = summary?.overdue_orders ?? 0;
    const lowLen = resourceCollectionLength(alerts.low_stock);
    const critLen = resourceCollectionLength(alerts.critical_stock);
    const outLen = resourceCollectionLength(alerts.out_of_stock);

    const handleExport = async (type) => {
        try {
            if (type === 'orders') {
                await reportService.exportOrders();
                pushToast({ title: 'Export', message: 'Orders CSV downloaded.', tone: 'success' });
            } else {
                await reportService.exportInventory();
                pushToast({ title: 'Export', message: 'Inventory CSV downloaded.', tone: 'success' });
            }
        } catch {
            pushToast({ title: 'Export failed', message: 'Could not download export.', tone: 'error' });
        }
    };

    return (
        <section className="space-y-4">
            <PageHeader
                title="Production Operations Dashboard"
                subtitle="Monitor production flow, machine health, and shift performance."
                actions={
                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button as={Button} variant="outline" size="sm" rightIcon={ChevronDownIcon}>
                            Export Reports
                        </Menu.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-[var(--erp-surface)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--erp-border)] overflow-hidden">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            type="button"
                                            onClick={() => handleExport('orders')}
                                            className={`${active ? 'bg-[var(--erp-surface-muted)]' : ''} block w-full px-4 py-2 text-left text-sm text-(--erp-ink)`}
                                        >
                                            Export Orders (CSV)
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            type="button"
                                            onClick={() => handleExport('inventory')}
                                            className={`${active ? 'bg-[var(--erp-surface-muted)]' : ''} block w-full px-4 py-2 text-left text-sm text-(--erp-ink)`}
                                        >
                                            Export Inventory (CSV)
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                }
            />

            {isLoading ? (
                <LoadingSkeleton lines={6} />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {dynamicStats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>
            )}

            <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
                <ActivityFeed items={activities} />
                <QuickActions actions={quickActions} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="erp-panel">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-(--erp-ink)">Production trend</h3>
                        <span className="rounded-md bg-[var(--erp-surface-muted)] px-2 py-0.5 text-[11px] text-(--erp-muted)">Last 7 days</span>
                    </div>
                    <div className="h-56 min-h-[224px] w-full">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendChartRows}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="output" name="Orders created" stroke="#1e3a8a" strokeWidth={2.5} dot />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </section>

                <section className="erp-panel">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-(--erp-ink)">Machine utilization</h3>
                        <span className="rounded-md bg-[var(--erp-surface-muted)] px-2 py-0.5 text-[11px] text-(--erp-muted)">By machine</span>
                    </div>
                    <div className="h-56 min-h-[224px] w-full">
                        {isMounted && machineChartRows.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={machineChartRows}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                                    <XAxis dataKey="machineName" stroke="#64748b" fontSize={11} interval={0} angle={-20} textAnchor="end" height={48} />
                                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                                    <Tooltip formatter={(v) => [`${v}%`, 'Utilization']} />
                                    <Bar dataKey="utilization" radius={[6, 6, 0, 0]} fill="#1e3a8a" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-(--erp-muted)">No machine utilization data.</div>
                        )}
                    </div>
                </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-1">
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
        </section>
    );
}
