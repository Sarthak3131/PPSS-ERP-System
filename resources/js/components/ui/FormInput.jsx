import React from 'react';
import cn from '../../utils/cn';

export default function FormInput({
    id,
    label,
    hint,
    error,
    rightAdornment,
    className,
    inputClassName,
    ...props
}) {
    return (
        <div className={cn('space-y-1', className)}>
            {label ? (
                <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--erp-muted)]">
                    {label}
                </label>
            ) : null}

            <div className="relative">
                <input
                    id={id}
                    className={cn(
                        'w-full rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface)] px-3 py-2 text-sm text-[var(--erp-ink)] shadow-sm outline-none ring-[var(--erp-primary)]/70 transition focus:ring-2 placeholder:text-[var(--erp-muted)]',
                        error
                            ? 'border-[var(--erp-danger)] ring-[var(--erp-danger)]/40'
                            : 'hover:border-[var(--erp-muted)]',
                        rightAdornment ? 'pr-11' : null,
                        inputClassName,
                    )}
                    {...props}
                />

                {rightAdornment ? <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightAdornment}</div> : null}
            </div>

            {hint ? <p className="text-xs text-[var(--erp-muted)]">{hint}</p> : null}
            {error ? <p className="text-xs text-[var(--erp-danger)]">{error}</p> : null}
        </div>
    );
}

