import React from 'react';
import cn from '../../utils/cn';

const VARIANTS = {
    primary:
        'bg-[var(--erp-primary)] text-white hover:bg-[var(--erp-primary-hover)] active:bg-[var(--erp-primary)]/90',
    secondary:
        'border border-[var(--erp-border)] bg-[var(--erp-surface)] text-[var(--erp-ink)] hover:bg-[var(--erp-surface-muted)] active:bg-[var(--erp-border)]',
    outline:
        'border border-[var(--erp-primary)]/30 bg-[var(--erp-primary)]/5 text-[var(--erp-primary)] hover:bg-[var(--erp-primary)]/10',
    ghost:
        'text-[var(--erp-muted)] hover:bg-[var(--erp-surface-muted)] hover:text-[var(--erp-ink)]',
    danger:
        'border border-[var(--erp-danger)]/30 bg-[var(--erp-danger)]/5 text-[var(--erp-danger)] hover:bg-[var(--erp-danger)]/10',
};

const SIZES = {
    sm: 'h-8 px-2.5 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-sm',
};

export default function Button({
    as: Component = 'button',
    variant = 'secondary',
    size = 'md',
    className,
    loading = false,
    disabled,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    children,
    ...props
}) {
    const isDisabled = Boolean(disabled || loading);

    return (
        <Component
            disabled={Component === 'button' ? isDisabled : undefined}
            aria-disabled={Component !== 'button' ? isDisabled : undefined}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium shadow-sm ring-1 ring-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)] disabled:pointer-events-none disabled:opacity-60 active:translate-y-[1px]',
                VARIANTS[variant] ?? VARIANTS.secondary,
                SIZES[size] ?? SIZES.md,
                className,
            )}
            {...props}
        >
            {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            ) : LeftIcon ? (
                <LeftIcon className="h-4 w-4" />
            ) : null}
            <span>{children}</span>
            {!loading && RightIcon ? <RightIcon className="h-4 w-4" /> : null}
        </Component>
    );
}

