import React from 'react';

export default function Card({ title, value, hint, trend }) {
    return (
        <div className="erp-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--erp-muted)]">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--erp-ink)]">{value}</p>
            {hint ? <p className="mt-2 text-sm leading-6 text-[var(--erp-muted)]">{hint}</p> : null}
            {trend ? <p className="mt-1 text-xs font-medium text-[var(--erp-success)]">{trend}</p> : null}
        </div>
    );
}
