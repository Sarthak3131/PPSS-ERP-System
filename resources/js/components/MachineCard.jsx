import React from 'react';
import StatusBadge from './StatusBadge';

export default function MachineCard({ name, capacity, status, utilization, shift, operator, maintenanceDue, efficiency, healthScore }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-3 transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h4 className="font-semibold text-slate-950 dark:text-slate-100">{name}</h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{capacity} units/hour</p>
                </div>

                <StatusBadge status={status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-slate-50 p-2.5 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-700">
                    <dt className="text-slate-500 dark:text-slate-300">Utilization</dt>
                    <dd className="mt-1 font-semibold text-slate-950 dark:text-slate-100">{utilization}</dd>
                </div>
                <div className="rounded-md bg-slate-50 p-2.5 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:ring-slate-700">
                    <dt className="text-slate-500 dark:text-slate-300">Shift</dt>
                    <dd className="mt-1 font-semibold text-slate-950 dark:text-slate-100">{shift}</dd>
                </div>
            </dl>
            <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p><span className="font-semibold text-slate-800 dark:text-slate-100">Operator:</span> {operator}</p>
                <p><span className="font-semibold text-slate-800 dark:text-slate-100">Maintenance Due:</span> {maintenanceDue}</p>
                <p><span className="font-semibold text-slate-800 dark:text-slate-100">Efficiency:</span> {efficiency}</p>
                <p><span className="font-semibold text-slate-800 dark:text-slate-100">Health Score:</span> {healthScore}</p>
            </div>
        </article>
    );
}