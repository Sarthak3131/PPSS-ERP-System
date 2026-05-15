import React from 'react';
import cn from '../../utils/cn';

export default function Select({ id, label, hint, error, className, selectClassName, children, ...props }) {
    return (
        <div className={cn('space-y-1', className)}>
            {label ? (
                <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--erp-muted)]">
                    {label}
                </label>
            ) : null}

            <select
                id={id}
                className={cn(
                    'h-9 w-full rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface)] px-3 text-sm text-[var(--erp-ink)] shadow-sm outline-none ring-[var(--erp-primary)]/70 transition focus:ring-2',
                    error ? 'border-[var(--erp-danger)] ring-[var(--erp-danger)]/40' : 'hover:border-[var(--erp-muted)]',
                    selectClassName,
                )}
                {...props}
            >
                {children}
            </select>

            {hint ? <p className="text-xs text-[var(--erp-muted)]">{hint}</p> : null}
            {error ? <p className="text-xs text-[var(--erp-danger)]">{error}</p> : null}
        </div>
    );
}

