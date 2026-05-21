import React from 'react';
import cn from '../../utils/cn';

export default function TableToolbar({ title, subtitle, left, right, className }) {
    return (
        <div className={cn('erp-panel flex flex-wrap items-center justify-between gap-2 px-3 py-2.5', className)}>
            {(title || subtitle) ? (
                <div className="min-w-48">
                    {title ? <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3> : null}
                    {subtitle ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">{subtitle}</p> : null}
                </div>
            ) : null}

            <div className="flex flex-1 items-center justify-end gap-1.5">
                {left ? <div className="flex items-center gap-2">{left}</div> : null}
                {right ? <div className="flex items-center gap-2">{right}</div> : null}
            </div>
        </div>
    );
}

