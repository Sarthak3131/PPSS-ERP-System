import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';

const DashboardChartsSection = React.memo(function DashboardChartsSection({ trendChartRows, machineChartRows }) {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <section className="erp-panel">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-(--erp-ink)">Production trend</h3>
                    <span className="rounded-md bg-[var(--erp-surface-muted)] px-2 py-0.5 text-[11px] text-(--erp-muted)">Last 7 days</span>
                </div>
                <div className="h-56 min-h-[224px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendChartRows}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                            <Tooltip isAnimationActive={false} />
                            <Line type="monotone" dataKey="output" name="Orders created" stroke="#1e3a8a" strokeWidth={2.5} dot isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="erp-panel">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-(--erp-ink)">Machine utilization</h3>
                    <span className="rounded-md bg-[var(--erp-surface-muted)] px-2 py-0.5 text-[11px] text-(--erp-muted)">By machine</span>
                </div>
                <div className="h-56 min-h-[224px] w-full">
                    {machineChartRows.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={machineChartRows}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                                <XAxis dataKey="machineName" stroke="#64748b" fontSize={11} interval={0} angle={-20} textAnchor="end" height={48} />
                                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                                <Tooltip isAnimationActive={false} formatter={(v) => [`${v}%`, 'Utilization']} />
                                <Bar dataKey="utilization" radius={[6, 6, 0, 0]} fill="#1e3a8a" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-(--erp-muted)">No machine utilization data.</div>
                    )}
                </div>
            </section>
        </div>
    );
});

export default DashboardChartsSection;
