import React from 'react';

const statusStyles = {
    Pending: 'bg-[var(--erp-warning)]/10 text-[var(--erp-warning)] ring-[var(--erp-warning)]/30',
    'In Progress': 'bg-[var(--erp-info)]/10 text-[var(--erp-info)] ring-[var(--erp-info)]/30',
    Completed: 'bg-[var(--erp-success)]/10 text-[var(--erp-success)] ring-[var(--erp-success)]/30',
    Draft: 'bg-[var(--erp-muted)]/10 text-[var(--erp-muted)] ring-[var(--erp-muted)]/30',
    Released: 'bg-[var(--erp-primary)]/10 text-[var(--erp-primary)] ring-[var(--erp-primary)]/30',
    'Low Stock': 'bg-[var(--erp-warning)]/10 text-[var(--erp-warning)] ring-[var(--erp-warning)]/30',
    'Out of Stock': 'bg-[var(--erp-danger)]/10 text-[var(--erp-danger)] ring-[var(--erp-danger)]/30',
    Active: 'bg-[var(--erp-success)]/10 text-[var(--erp-success)] ring-[var(--erp-success)]/30',
    Idle: 'bg-[var(--erp-muted)]/10 text-[var(--erp-muted)] ring-[var(--erp-muted)]/30',
    Maintenance: 'bg-[var(--erp-danger)]/10 text-[var(--erp-danger)] ring-[var(--erp-danger)]/30',
    'In Stock': 'bg-[var(--erp-success)]/10 text-[var(--erp-success)] ring-[var(--erp-success)]/30',
    Low: 'bg-[var(--erp-warning)]/10 text-[var(--erp-warning)] ring-[var(--erp-warning)]/30',
    Out: 'bg-[var(--erp-danger)]/10 text-[var(--erp-danger)] ring-[var(--erp-danger)]/30',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 transition-all duration-200 ${statusStyles[status] || 'bg-[var(--erp-muted)]/10 text-[var(--erp-muted)] ring-[var(--erp-muted)]/30'}`}>
            {status}
        </span>
    );
}
