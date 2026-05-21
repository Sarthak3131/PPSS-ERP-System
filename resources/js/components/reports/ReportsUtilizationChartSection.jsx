import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

export default React.memo(function ReportsUtilizationChartSection({ chartUtilizationData }) {
    return (
        <section className="erp-panel">
            <h3 className="text-sm font-semibold text-(--erp-ink)">Utilization Chart</h3>
            <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartUtilizationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                        <XAxis dataKey="line" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip isAnimationActive={false} />
                        <Bar dataKey="utilization" fill="#047857" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 border-t border-(--erp-border) pt-2 text-xs text-(--erp-muted)">Live machine utilization %</div>
        </section>
    );
});
