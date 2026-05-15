import React from 'react';

export default function StatCard({ title, value, hint, trend, icon: Icon }) {
    return (
        <article className="erp-panel p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">{title}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{value}</p>
                </div>

                {Icon ? (
                    <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-indigo-500/30">
                        <Icon className="h-5 w-5" />
                    </div>
                ) : null}
            </div>

            {hint ? <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{hint}</p> : null}
            {trend ? <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{trend}</p> : null}
        </article>
    );
}