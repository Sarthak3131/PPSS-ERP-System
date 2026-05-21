import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from '../StatusBadge';
import { formatSizeDimensions } from './sizeFormatting';

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function DetailCard({ label, value }) { return <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">{label}</p><p className="mt-2 text-sm font-medium text-[var(--erp-ink)]">{value}</p></div>; }

export default function SizeDetailsModal({ open, onClose, size, onEdit, onArchive, onDelete }) {
    if (!size) return null;
    const dimensions = formatSizeDimensions(size);
    const materialType = size.materialType || '—';
    const usageNotes = size.usageNotes || '—';
    const operationalRemarks = size.operationalRemarks || '—';
    return <Modal open={open} onClose={onClose} title={size.displayName} description={`${size.sizeCode} · ${size.category}`} size="lg" footer={<div className="flex w-full flex-wrap justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Close</Button><Button type="button" variant="danger" onClick={onDelete}>Delete</Button><Button type="button" variant="outline" onClick={onArchive}>Archive</Button><Button type="button" variant="primary" onClick={onEdit}>Edit Size</Button></div>}><div className="space-y-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="space-y-2"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={size.status} /><span className={['inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1', size.status === 'Archived' ? 'bg-[var(--erp-muted)]/10 text-[var(--erp-muted)] ring-[var(--erp-muted)]/30' : 'bg-[var(--erp-success)]/10 text-[var(--erp-success)] ring-[var(--erp-success)]/30'].join(' ')}>{size.status}</span></div><p className="max-w-2xl text-sm text-[var(--erp-muted)]">{size.notes || 'No notes provided.'}</p></div><div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-4 py-3 text-right"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Tolerance</p><p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--erp-ink)]">{size.tolerance}</p></div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><DetailCard label="Display Name" value={size.displayName} /><DetailCard label="Category" value={size.category} /><DetailCard label="Dimensions" value={dimensions} /><DetailCard label="Unit" value={size.unit} /><DetailCard label="Material Type" value={materialType} /><DetailCard label="Usage Dependencies" value={`${Number(size.usageCount) || 0} products`} /></div><div className="grid gap-3 md:grid-cols-3"><DetailCard label="Supplier Compatibility" value={size.supplierCompatibility || '—'} /><DetailCard label="Inventory Quantity" value={`${Number(size.inventoryQuantity) || 0} units`} /><DetailCard label="Operational Remarks" value={operationalRemarks} /></div><div className="grid gap-3 md:grid-cols-2"><DetailCard label="Usage Notes" value={usageNotes} /><DetailCard label="Updated Date" value={formatDate(size.updatedAt)} /></div><div className="space-y-2"><h4 className="text-sm font-semibold text-[var(--erp-ink)]">Linked Products</h4><div className="flex flex-wrap gap-2">{Array.isArray(size.linkedProducts) && size.linkedProducts.length > 0 ? size.linkedProducts.map((product) => <span key={product.id} className="rounded-full border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--erp-ink)]" title={product.sku}>{product.name}</span>) : <span className="text-sm text-[var(--erp-muted)]">No linked products.</span>}</div></div></div></Modal>;
}
