import React from 'react';
import cn from '../../utils/cn';

const VARIANTS = {
    primary:
        'bg-(--erp-primary) text-white hover:bg-(--erp-primary-hover) active:bg-(--erp-primary)/90',
    secondary:
        'border border-(--erp-border) bg-(--erp-surface) text-(--erp-ink) hover:bg-(--erp-surface-muted) active:bg-(--erp-border)',
    outline:
        'border border-(--erp-primary)/30 bg-(--erp-primary)/5 text-(--erp-primary) hover:bg-(--erp-primary)/10',
    ghost:
        'text-(--erp-muted) hover:bg-(--erp-surface-muted) hover:text-(--erp-ink)',
    danger:
        'border border-(--erp-danger)/30 bg-(--erp-danger)/5 text-(--erp-danger) hover:bg-(--erp-danger)/10',
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
                'inline-flex items-center justify-center gap-2 rounded-lg font-medium shadow-sm ring-1 ring-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary) disabled:pointer-events-none disabled:opacity-60 active:translate-y-px',
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

