import React from 'react';

const statusClasses = {
    Released: 'bg-cyan-50 text-cyan-700 ring-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-400/20',
    Ready: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
    Completed: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
};

export default function ActivityFeed({ items = [] }) {
    return (
        <article className="erp-panel p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Recent Activity</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Live operational updates from the shop floor.</p>
                </div>
            </div>

            <ul className="space-y-2.5">
                {items.map((item) => (
                    <li key={item.title} className="relative rounded-lg border border-slate-200 bg-slate-50/80 p-3 transition-colors dark:border-slate-700 dark:bg-slate-800/40">
                        <span className="absolute left-0 top-3 h-8 w-1 rounded-r bg-indigo-500" />
                        <div className="ml-2 flex items-start justify-between gap-4">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
                            </div>

                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[item.status] || 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'}`}>
                                {item.status}
                            </span>
                        </div>

                        <div className="ml-2 mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                            <span>{item.time}</span>
                            <span>Work Orders</span>
                        </div>
                    </li>
                ))}
            </ul>
        </article>
    );
}