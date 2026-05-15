import React from 'react';
import cn from '../../utils/cn';

export default function EmptyState({ title = 'No results', description, icon: Icon, action, className }) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900',
                className,
            )}
        >
            {Icon ? (
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                    <Icon className="h-6 w-6" />
                </div>
            ) : null}
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
            {description ? <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-300">{description}</p> : null}
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}

