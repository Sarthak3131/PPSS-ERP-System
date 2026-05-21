import React from 'react';
import cn from '../../utils/cn';

export default function Select({ id, label, hint, error, className, selectClassName, children, ...props }) {
    return (
        <div className={cn('space-y-1', className)}>
            {label ? (
                <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.12em] text-(--erp-muted)">
                    {label}
                </label>
            ) : null}

            <select
                id={id}
                className={cn(
                    'h-9 w-full rounded-lg border border-(--erp-border) bg-(--erp-surface) px-3 text-sm text-(--erp-ink) shadow-sm outline-none ring-(--erp-primary)/70 transition focus:ring-2',
                    error ? 'border-(--erp-danger) ring-(--erp-danger)/40' : 'hover:border-(--erp-muted)',
                    selectClassName,
                )}
                {...props}
            >
                {children}
            </select>

            {hint ? <p className="text-xs text-(--erp-muted)">{hint}</p> : null}
            {error ? <p className="text-xs text-(--erp-danger)">{error}</p> : null}
        </div>
    );
}

