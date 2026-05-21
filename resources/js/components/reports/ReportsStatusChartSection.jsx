import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

export default React.memo(function ReportsStatusChartSection({ chartStatusData }) {
    return (
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
                        <Tooltip isAnimationActive={false} />
                        <Line type="monotone" dataKey="count" stroke="#1e3a8a" strokeWidth={2.5} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 border-t border-(--erp-border) pt-2 text-xs text-(--erp-muted)">Live snapshot from database</div>
        </section>
    );
});
