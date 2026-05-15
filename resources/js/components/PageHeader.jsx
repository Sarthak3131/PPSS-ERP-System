import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="erp-panel mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-[var(--erp-ink)]">{title}</h2>
                {subtitle ? <p className="mt-0.5 max-w-3xl text-sm text-[var(--erp-muted)]">{subtitle}</p> : null}
            </div>

            {actions ? <div className="flex items-center gap-1.5">{actions}</div> : null}
        </div>
    );
}
