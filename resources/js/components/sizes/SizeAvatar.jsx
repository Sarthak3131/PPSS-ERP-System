import React from 'react';
import cn from '../../utils/cn';

export default function SizeAvatar({ label, className }) {
    const initials = String(label || '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'S';

    return <div className={cn('flex h-full w-full items-center justify-center rounded-xl bg-[var(--erp-primary)]/10 text-xs font-semibold text-[var(--erp-primary)] ring-1 ring-[var(--erp-primary)]/20', className)}>{initials}</div>;
}
