import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickActions({ actions = [] }) {
    return (
        <article className="erp-panel">
            <div className="mb-4 border-b border-[var(--erp-border)] pb-3">
                <h3 className="text-sm font-semibold text-[var(--erp-ink)]">Quick Actions</h3>
                <p className="mt-1 text-xs text-[var(--erp-muted)]">Common planning tasks for the current shift.</p>
            </div>

            <div className="grid gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            to={action.href}
                            className="group flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-3 transition-all duration-300 hover:scale-[1.02] hover:border-[var(--erp-primary)] hover:bg-[var(--erp-surface)] hover:shadow-md"
                        >
                            <div className="rounded-lg bg-[var(--erp-surface)] p-2 text-[var(--erp-muted)] shadow-sm transition-colors group-hover:text-[var(--erp-primary)]">
                                {Icon && <Icon className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[var(--erp-ink)] transition-colors group-hover:text-[var(--erp-primary)]">{action.label}</p>
                                <p className="mt-0.5 text-xs text-[var(--erp-muted)]">{action.description}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </article>
    );
}