import React from 'react';
import { QueueListIcon, CubeIcon, CheckCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import useAppStore from '../store/appStore';
import * as inventoryService from '../services/inventoryService';
import * as reportService from '../services/reportService';
import { useToast } from '../components/ui/ToastProvider';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import PageLoader from '../components/PageLoader';

const DashboardSupportSection = React.lazy(() => import('../components/dashboard/DashboardSupportSection'));
const DashboardChartsSection = React.lazy(() => import('../components/dashboard/DashboardChartsSection'));

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

const Dashboard = React.memo(function Dashboard() {
    const [isLoading, setIsLoading] = React.useState(true);
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
        fetchDashboardData();
    }, []);

    const dynamicStats = React.useMemo(() => (summary ? [
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
          ] : []), [summary]);

    const trendChartRows = React.useMemo(() => trendRows, [trendRows]);
    const machineChartRows = React.useMemo(() => machineBars, [machineBars]);

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
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-(--erp-surface) shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-(--erp-border) overflow-hidden">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            type="button"
                                            onClick={() => handleExport('orders')}
                                            className={`${active ? 'bg-(--erp-surface-muted)' : ''} block w-full px-4 py-2 text-left text-sm text-(--erp-ink)`}
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
                                            className={`${active ? 'bg-(--erp-surface-muted)' : ''} block w-full px-4 py-2 text-left text-sm text-(--erp-ink)`}
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

            <React.Suspense fallback={<PageLoader label="Loading dashboard sections..." />}>
                <DashboardSupportSection activities={activities} summary={summary} alerts={alerts} />
            </React.Suspense>

            <React.Suspense fallback={<LoadingSkeleton lines={8} />}>
                <DashboardChartsSection trendChartRows={trendChartRows} machineChartRows={machineChartRows} />
            </React.Suspense>
        </section>
    );
});

export default Dashboard;
