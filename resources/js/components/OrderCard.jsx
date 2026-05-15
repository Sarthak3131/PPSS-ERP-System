import React from 'react';
import StatusBadge from './StatusBadge';

export default function OrderCard({ order, selected, onSelect }) {
    return (
        <article
            role="button"
            onClick={() => onSelect(order.orderId)}
            className={`group flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-3 transition-all duration-200 hover:shadow-md dark:border-slate-700 ${
                selected ? 'border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:ring-indigo-500/30' : 'bg-white dark:bg-slate-900'
            }`}
        >
            <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{order.orderId}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{order.product}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Size: {order.size} • Qty: {order.quantity}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Priority: {order.priority || 'Medium'} • ETA: {order.estimatedDuration || '4h'}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">Operator Req: {order.operatorRequirement || '2 operators'}</p>
            </div>

            <div className="flex w-28 flex-col items-end gap-2">
                {order.assignedMachineId ? (
                    <StatusBadge status="Released" />
                ) : (
                    <StatusBadge status="Pending" />
                )}

                <span className="text-xs text-rose-500 dark:text-rose-300">Due {order.dueDate}</span>
            </div>
        </article>
    );
}
