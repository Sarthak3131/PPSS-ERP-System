import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

export default React.memo(function ReportsInventoryRiskChartSection({ chartInventoryRiskData }) {
    return (
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
                        <Tooltip isAnimationActive={false} />
                        <Bar dataKey="count" fill="#be123c" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 border-t border-(--erp-border) pt-2 text-xs text-(--erp-muted)">Breakdown of inventory shortages</div>
        </section>
    );
});
