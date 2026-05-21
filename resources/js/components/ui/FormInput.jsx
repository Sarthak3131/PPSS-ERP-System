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
                <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.12em] text-(--erp-muted)">
                    {label}
                </label>
            ) : null}

            <div className="relative">
                <input
                    id={id}
                    className={cn(
                        'w-full rounded-lg border border-(--erp-border) bg-(--erp-surface) px-3 py-2 text-sm text-(--erp-ink) shadow-sm outline-none ring-(--erp-primary)/70 transition focus:ring-2 placeholder:text-(--erp-muted)',
                        error
                            ? 'border-(--erp-danger) ring-(--erp-danger)/40'
                            : 'hover:border-(--erp-muted)',
                        rightAdornment ? 'pr-11' : null,
                        inputClassName,
                    )}
                    {...props}
                />

                {rightAdornment ? <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightAdornment}</div> : null}
            </div>

            {hint ? <p className="text-xs text-(--erp-muted)">{hint}</p> : null}
            {error ? <p className="text-xs text-(--erp-danger)">{error}</p> : null}
        </div>
    );
}

