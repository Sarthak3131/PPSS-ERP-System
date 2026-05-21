import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from '../StatusBadge';
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

function DetailCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">{label}</p>
            <p className="mt-2 text-sm font-medium text-[var(--erp-ink)]">{value}</p>
        </div>
    );
}

export default function ProductDetailsModal({ open, onClose, product, onEdit, onDelete }) {
    if (!product) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={product.name}
            description={`${product.sku} · ${product.category}`}
            size="lg"
            footer={
                <div className="flex w-full flex-wrap justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button type="button" variant="danger" onClick={onDelete}>
                        Delete
                    </Button>
                    <Button type="button" variant="primary" onClick={onEdit}>
                        Edit Product
                    </Button>
                </div>
            }
        >
            <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-2xl">
                            <ProductAvatar name={product.name} imageUrl={product.imageUrl} />
                        </div>
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={product.status} />
                                <span className={[
                                    'inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1',
                                    product.active
                                        ? 'bg-[var(--erp-success)]/10 text-[var(--erp-success)] ring-[var(--erp-success)]/30'
                                        : 'bg-[var(--erp-muted)]/10 text-[var(--erp-muted)] ring-[var(--erp-muted)]/30',
                                ].join(' ')}>
                                    {product.active ? 'Active' : 'Inactive'}
                                </span>
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
                            <p className="max-w-2xl text-sm text-[var(--erp-muted)]">{product.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-4 py-3 text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Base Price</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--erp-ink)]">{formatCurrency(product.basePrice)}</p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <DetailCard label="SKU" value={product.sku} />
                    <DetailCard label="Category" value={product.category} />
                    <DetailCard label="Sizes Count" value={`${Array.isArray(product.sizes) ? product.sizes.length : 0} variants`} />
                    <DetailCard label="Created Date" value={formatDate(product.createdAt)} />
                    <DetailCard label="Supplier" value={product.supplierName || 'Unassigned'} />
                    <DetailCard label="Updated Date" value={formatDate(product.updatedAt)} />
                    <DetailCard label="Inventory Quantity" value={`${Number(product.inventoryQuantity ?? product.stockOnHand) || 0} units`} />
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[var(--erp-ink)]">Supported Sizes</h4>
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                            product.sizes.map((size) => (
                                <span key={size} className="rounded-full border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--erp-ink)]">
                                    {size}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-[var(--erp-muted)]">No size data available.</span>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
