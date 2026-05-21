import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import cn from '../../utils/cn';

const ICONS = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    info: InformationCircleIcon,
};

export function ToastViewport({ children }) {
    if (typeof document === 'undefined') return null;
    return createPortal(<div className="fixed right-4 top-8 z-60 space-y-2">{children}</div>, document.body);
}

export function Toast({ tone = 'info', title, message, onClose }) {
    const Icon = ICONS[tone] ?? ICONS.info;

    const toneClasses =
        tone === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100'
            : tone === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100'
              : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

    return (
        <div className={cn('w-[min(26rem,calc(100vw-2rem))] rounded-2xl border px-4 py-3 shadow-lg', toneClasses)}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    {title ? <p className="text-sm font-semibold">{title}</p> : null}
                    {message ? <p className="mt-0.5 text-sm opacity-80">{message}</p> : null}
                </div>
                {onClose ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-1.5 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                ) : null}
            </div>
        </div>
    );
}

