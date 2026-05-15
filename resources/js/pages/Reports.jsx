import React from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/ui/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import TableToolbar from '../components/ui/TableToolbar';
import Select from '../components/ui/Select';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import * as reportService from '../services/reportService';
import { useToast } from '../components/ui/ToastProvider';

const EMPTY_SUMMARY = {
    total_orders: 0,
    released: 0,
    in_progress: 0,
    completed: 0,
    draft: 0,
    pending: 0,
};

export default function Reports() {
    const [timeRange, setTimeRange] = React.useState('7d');
    const [plant, setPlant] = React.useState('Plant A');
    
    const [summary, setSummary] = React.useState(null);
    const [utilization, setUtilization] = React.useState([]);
    const [inventory, setInventory] = React.useState(null);
    const [logs, setLogs] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [errorMessage, setErrorMessage] = React.useState(null);
    
    const { push: pushToast } = useToast();

    const fetchReports = async (overrides = {}) => {
        setIsLoading(true);
        setErrorMessage(null);
        const tr = overrides.timeRange ?? timeRange;
        const pl = overrides.plant ?? plant;
        const params = { time_range: tr, plant: pl };
        try {
            const [sumRes, utilRes, invRes, logsRes] = await Promise.all([
                reportService.productionSummary(params),
                reportService.machineUtilization(params),
                reportService.inventoryRisk(params),
                reportService.activityLog(1, params)
            ]);
            setSummary(sumRes);
            setUtilization(Array.isArray(utilRes) ? utilRes : []);
            setInventory(invRes);
            setLogs(Array.isArray(logsRes) ? logsRes : []);
        } catch (error) {
            setSummary(EMPTY_SUMMARY);
            setUtilization([]);
            setInventory({ low_stock: [], critical_stock: [], out_of_stock: [] });
            setLogs([]);
            const msg = error?.response?.data?.message ?? 'Failed to load reports';
            setErrorMessage(msg);
            pushToast({ title: 'Error', message: msg, tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchReports();
    }, [timeRange, plant]);

    const summaryData = summary ?? EMPTY_SUMMARY;

    const reportCards = [
        {
            title: 'Total Orders',
            value: summaryData.total_orders,
            hint: 'Orders in system',
            trend: 'Live API',
        },
        {
            title: 'Orders Released/Active',
            value: (summaryData.released ?? 0) + (summaryData.in_progress ?? 0),
            hint: 'Currently active',
            trend: 'Live API',
        },
        {
            title: 'Orders Completed',
            value: summaryData.completed,
            hint: 'Finished goods',
            trend: 'Live API',
        },
    ];

    const statusData = summary
        ? [
              { status: 'Draft', count: summaryData.draft ?? 0 },
              { status: 'Pending', count: summaryData.pending ?? 0 },
              { status: 'Released', count: summaryData.released ?? 0 },
              { status: 'In Progress', count: summaryData.in_progress ?? 0 },
              { status: 'Completed', count: summaryData.completed ?? 0 },
          ]
        : [];

    const inventoryRiskData = inventory
        ? [
              { risk: 'Low', count: Array.isArray(inventory.low_stock) ? inventory.low_stock.length : 0 },
              { risk: 'Critical', count: Array.isArray(inventory.critical_stock) ? inventory.critical_stock.length : 0 },
              { risk: 'Out of Stock', count: Array.isArray(inventory.out_of_stock) ? inventory.out_of_stock.length : 0 },
          ]
        : [];

    const mappedUtilization = utilization.map((u) => ({
        line: u.machine?.name ?? '—',
        utilization: Number(u.utilization_percentage) || 0,
    }));

    const chartStatusData = statusData;
    const chartInventoryRiskData = inventoryRiskData;
    const chartUtilizationData = mappedUtilization;

    return (
        <section className="space-y-4">
            <PageHeader
                title="Reports"
                subtitle="Reporting module shell for KPI and operational analytics."
                actions={
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" size="sm" leftIcon={ArrowDownTrayIcon} onClick={() => reportService.exportOrders({ time_range: timeRange, plant })}>
                            Export Orders
                        </Button>
                        <Button type="button" variant="secondary" size="sm" leftIcon={ArrowDownTrayIcon} onClick={() => reportService.exportInventory({ plant })}>
                            Export Inventory
                        </Button>
                    </div>
                }
            />

            {errorMessage ? (
                <div className="rounded-xl border border-[var(--erp-danger)]/30 bg-[var(--erp-danger)]/10 px-4 py-3 text-sm text-[var(--erp-danger)]">
                    {errorMessage}
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {reportCards.map((card) => (
                    <Card key={card.title} {...card} />
                ))}
            </div>

            <TableToolbar
                title="Report Filters"
                subtitle="Adjust operational report scope."
                right={
                    <>
                        <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="min-w-36" aria-label="Select time range">
                            <option value="7d">Last 7 days</option>
                            <option value="14d">Last 14 days</option>
                            <option value="30d">Last 30 days</option>
                        </Select>
                        <Select value={plant} onChange={(e) => setPlant(e.target.value)} className="min-w-36" aria-label="Select plant">
                            <option>Plant A</option>
                            <option>Plant B</option>
                            <option>Plant C</option>
                        </Select>
                        <Button size="sm" variant="secondary" onClick={() => { setTimeRange('7d'); setPlant('Plant A'); }}>Reset</Button>
                    </>
                }
            />
            {isLoading ? <LoadingSkeleton lines={10} /> : <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <section className="erp-panel">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-(--erp-ink)">Order Status Funnel</h3>
                            <span className="text-xs text-(--erp-success)">Live State</span>
                        </div>
                        <div className="mt-2 h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                                    <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#1e3a8a" strokeWidth={2.5} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 border-t border-(--erp-border) pt-2 text-xs text-(--erp-muted)">Live snapshot from database</div>
                    </section>

                    <section className="erp-panel">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-(--erp-ink)">Inventory Risk Profile</h3>
                            <span className="text-xs text-(--erp-danger)">Critical Alerts</span>
                        </div>
                        <div className="mt-2 h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartInventoryRiskData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                                    <XAxis dataKey="risk" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#be123c" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 border-t border-(--erp-border) pt-2 text-xs text-(--erp-muted)">Breakdown of inventory shortages</div>
                    </section>
                </div>

                <aside className="space-y-4">
                    <section className="erp-panel">
                        <h3 className="text-sm font-semibold text-(--erp-ink)">Utilization Chart</h3>
                        <div className="mt-2 h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartUtilizationData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                                    <XAxis dataKey="line" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} />
                                    <Tooltip />
                                    <Bar dataKey="utilization" fill="#047857" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 border-t border-(--erp-border) pt-2 text-xs text-(--erp-muted)">Live machine utilization %</div>
                    </section>
                    <section className="erp-panel">
                        <h3 className="text-lg font-semibold text-(--erp-ink)">Activity Log</h3>
                        <p className="mt-1 text-sm text-(--erp-muted)">Recent system events.</p>

                        <div className="mt-5 max-h-75 space-y-3 overflow-y-auto pr-2">
                            {logs.length === 0 ? <p className="text-sm text-(--erp-muted)">No activity logs found.</p> : logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="erp-subpanel"
                                >
                                    <p className="text-sm font-semibold text-(--erp-ink)">{log.action_type}</p>
                                    <div className="mt-1 flex justify-between text-xs text-(--erp-muted)">
                                        <span>Entity: {log.entity_type}</span>
                                        <span>{new Date(log.created_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>}
        </section>
    );
}
