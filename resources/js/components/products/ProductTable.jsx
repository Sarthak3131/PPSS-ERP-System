import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, EyeIcon, PencilSquareIcon, TrashIcon, ArchiveBoxIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../StatusBadge';
import cn from '../../utils/cn';
import ProductAvatar from './ProductAvatar';

function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function PaginationButton({ children, disabled, onClick, active = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
                active
                    ? 'border-[var(--erp-primary)] bg-[var(--erp-primary)]/10 text-[var(--erp-primary)]'
                    : 'border-[var(--erp-border)] bg-[var(--erp-surface)] text-[var(--erp-ink)] hover:border-[var(--erp-muted)] hover:bg-[var(--erp-surface-muted)]',
            )}
        >
            {children}
        </button>
    );
}

const ProductTable = React.memo(function ProductTable({
    products,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onView,
    onEdit,
    onDuplicate,
    onArchive,
    onDelete,
    page,
    totalPages,
    onPageChange,
    rangeLabel,
}) {
    const currentIds = products.map((product) => product.id);
    const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id));
    const someSelected = currentIds.some((id) => selectedIds.includes(id));

    return (
        <div className="erp-panel overflow-hidden p-0">
            <div className="overflow-x-auto overscroll-x-contain">
                <table className="min-w-[980px] table-fixed divide-y divide-[var(--erp-border)] text-sm">
                    <thead className="sticky top-0 z-10 bg-[var(--erp-surface-muted)]/95 backdrop-blur">
                        <tr>
                            <th className="w-10 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(node) => {
                                        if (node) node.indeterminate = !allSelected && someSelected;
                                    }}
                                    onChange={(event) => onToggleSelectAll(event.target.checked)}
                                    className="h-4 w-4 rounded border-[var(--erp-border)] text-[var(--erp-primary)] focus:ring-[var(--erp-primary)]"
                                    aria-label="Select all products on this page"
                                />
                            </th>
                            <th className="w-[28%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Product Name</th>
                            <th className="w-[13%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">SKU</th>
                            <th className="w-[12%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Category</th>
                            <th className="w-[12%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Status</th>
                            <th className="w-[12%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Base Price</th>
                            <th className="w-[10%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Sizes Count</th>
                            <th className="w-[11%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Created Date</th>
                            <th className="w-[12%] px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--erp-border)]">
                        {products.map((product) => {
                            const selected = selectedIds.includes(product.id);
                            return (
                                <tr
                                    key={product.id}
                                    onClick={() => onView(product)}
                                    className={cn('group h-[88px] cursor-pointer bg-[var(--erp-surface)] transition-all duration-200 hover:bg-[var(--erp-surface-muted)]', selected ? 'bg-[var(--erp-primary)]/5 ring-1 ring-[var(--erp-primary)]/20' : '')}
                                >
                                    <td className="align-middle px-4 py-2.5">
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={(event) => onToggleSelect(product.id, event.target.checked)}
                                            onClick={(event) => event.stopPropagation()}
                                            className="h-4 w-4 align-middle rounded border-[var(--erp-border)] text-[var(--erp-primary)] focus:ring-[var(--erp-primary)]"
                                            aria-label={`Select ${product.name}`}
                                        />
                                    </td>
                                    <td className="align-middle px-4 py-2.5">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="h-10 w-10 flex-none overflow-hidden rounded-xl self-center">
                                                <ProductAvatar name={product.name} imageUrl={product.imageUrl} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-[var(--erp-ink)]" title={product.name}>{product.name}</p>
                                                <p className="mt-0.5 line-clamp-2 h-10 overflow-hidden text-ellipsis text-xs leading-5 text-[var(--erp-muted)]" title={product.description || 'Catalog product record'}>{product.description || 'Catalog product record'}</p>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    <span className={[
                                                        'inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1',
                                                        product.inventoryStatus === 'Low Stock'
                                                            ? 'bg-[var(--erp-warning)]/10 text-[var(--erp-warning)] ring-[var(--erp-warning)]/30'
                                                            : product.inventoryStatus === 'Out of Stock'
                                                                ? 'bg-[var(--erp-danger)]/10 text-[var(--erp-danger)] ring-[var(--erp-danger)]/30'
                                                                : product.inventoryStatus === 'Archived'
                                                                    ? 'bg-[var(--erp-muted)]/10 text-[var(--erp-muted)] ring-[var(--erp-muted)]/30'
                                                                    : 'bg-[var(--erp-success)]/10 text-[var(--erp-success)] ring-[var(--erp-success)]/30',
                                                    ].join(' ')}>
                                                        {product.inventoryStatus || 'In Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="align-middle truncate px-4 py-2.5 text-[var(--erp-ink)]" title={product.sku}>{product.sku}</td>
                                    <td className="align-middle truncate px-4 py-2.5 text-[var(--erp-ink)]" title={product.category}>{product.category}</td>
                                    <td className="align-middle px-4 py-2.5"><StatusBadge status={product.status} /></td>
                                    <td className="align-middle px-4 py-2.5 font-medium text-[var(--erp-ink)]">{formatCurrency(product.basePrice)}</td>
                                    <td className="align-middle px-4 py-2.5 text-[var(--erp-ink)]">{Array.isArray(product.sizes) ? product.sizes.length : 0}</td>
                                    <td className="align-middle px-4 py-2.5 text-[var(--erp-muted)]">{formatDate(product.createdAt)}</td>
                                    <td className="align-middle px-4 py-2.5 text-right">
                                        <Menu as="div" className="relative inline-block text-left" onClick={(event) => event.stopPropagation()}>
                                            <Menu.Button className="inline-flex items-center justify-center rounded-lg border border-[var(--erp-border)] bg-[var(--erp-surface)] p-2 text-[var(--erp-muted)] transition hover:border-[var(--erp-muted)] hover:bg-[var(--erp-surface-muted)] hover:text-[var(--erp-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)]">
                                                <EllipsisVerticalIcon className="h-4 w-4" />
                                            </Menu.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-120"
                                                enterFrom="transform opacity-0 scale-95 translate-y-1"
                                                enterTo="transform opacity-100 scale-100 translate-y-0"
                                                leave="transition ease-in duration-90"
                                                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                                                leaveTo="transform opacity-0 scale-95 translate-y-1"
                                            >
                                                <Menu.Items className="absolute right-0 z-[70] mt-2 w-56 max-w-[calc(100vw-1rem)] origin-top-right rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)] focus:outline-none dark:shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button type="button" onClick={() => onView(product)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)]', active ? 'bg-[var(--erp-surface-muted)] text-[var(--erp-ink)]' : 'text-[var(--erp-ink)]')}>
                                                                <EyeIcon className="h-4 w-4 flex-none" />
                                                                <span>View Details</span>
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button type="button" onClick={() => onEdit(product)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)]', active ? 'bg-[var(--erp-surface-muted)] text-[var(--erp-ink)]' : 'text-[var(--erp-ink)]')}>
                                                                <PencilSquareIcon className="h-4 w-4 flex-none" />
                                                                <span>Edit Product</span>
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <div className="my-1 border-t border-[var(--erp-border)]" />
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button type="button" onClick={() => onDuplicate(product)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)]', active ? 'bg-[var(--erp-surface-muted)] text-[var(--erp-ink)]' : 'text-[var(--erp-ink)]')}>
                                                                <DocumentDuplicateIcon className="h-4 w-4 flex-none" />
                                                                <span>Duplicate Product</span>
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button type="button" onClick={() => onArchive(product)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)]', active ? 'bg-[var(--erp-surface-muted)] text-[var(--erp-ink)]' : 'text-[var(--erp-ink)]')}>
                                                                <ArchiveBoxIcon className="h-4 w-4 flex-none" />
                                                                <span>Archive Product</span>
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <div className="my-1 border-t border-[var(--erp-border)]" />
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button type="button" onClick={() => onDelete(product)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[var(--erp-danger)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)]', active ? 'bg-[var(--erp-danger)]/10' : '')}>
                                                                <TrashIcon className="h-4 w-4 flex-none" />
                                                                <span>Delete Product</span>
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--erp-border)] px-4 py-4">
                <div className="text-sm text-[var(--erp-muted)]">
                    {rangeLabel}
                </div>

                <div className="flex items-center gap-2">
                    <PaginationButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                        <ChevronLeftIcon className="h-4 w-4" />
                    </PaginationButton>

                    {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <PaginationButton key={pageNumber} active={pageNumber === page} onClick={() => onPageChange(pageNumber)}>
                                {pageNumber}
                            </PaginationButton>
                        );
                    })}

                    <PaginationButton disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                        <ChevronRightIcon className="h-4 w-4" />
                    </PaginationButton>
                </div>
            </div>
        </div>
    );
});

export default ProductTable;
