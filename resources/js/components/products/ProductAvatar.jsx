import React from 'react';
import cn from '../../utils/cn';

function initials(value) {
    const parts = String(value || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    return parts.slice(0, 2).map((part) => part.slice(0, 1)).join('').toUpperCase() || 'P';
}

export default function ProductAvatar({ name, imageUrl, className }) {
    if (imageUrl) {
        return <img src={imageUrl} alt={name} className={cn('h-full w-full rounded-xl object-cover', className)} />;
    }

    return (
        <div className={cn('flex h-full w-full items-center justify-center rounded-xl bg-[var(--erp-primary)]/10 text-xs font-semibold text-[var(--erp-primary)] ring-1 ring-[var(--erp-primary)]/20', className)}>
            {initials(name)}
        </div>
    );
}
