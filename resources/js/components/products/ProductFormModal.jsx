import React from 'react';
import { Switch } from '@headlessui/react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import cn from '../../utils/cn';
import { PRODUCT_CATEGORIES, PRODUCT_SIZE_OPTIONS, PRODUCT_STATUS_OPTIONS } from '../../data/mockProducts';

const EMPTY_FORM = {
    name: '',
    sku: '',
    description: '',
    category: '',
    status: 'Active',
    basePrice: '',
    sizes: [],
    active: true,
};

function slugifySku(name) {
    const base = String(name || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return base ? `${base.slice(0, 3)}-${base.slice(3, 7) || '000'}-${base.slice(7, 11) || '001'}` : '';
}

export default function ProductFormModal({ open, onClose, onSubmit, mode = 'create', product = null, isSaving = false }) {
    const [form, setForm] = React.useState(EMPTY_FORM);
    const [errors, setErrors] = React.useState({});
    const [skuTouched, setSkuTouched] = React.useState(false);

    const skuSuggestion = React.useMemo(() => slugifySku(form.name), [form.name]);
    const canSubmit = React.useMemo(() => {
        return Boolean(
            form.name.trim() &&
                form.sku.trim() &&
                form.category &&
                form.status &&
                Number(form.basePrice) > 0 &&
                form.sizes.length > 0,
        );
    }, [form]);

    React.useEffect(() => {
        if (!open) return;

        if (product) {
            setForm({
                name: product.name ?? '',
                sku: product.sku ?? '',
                description: product.description ?? '',
                category: product.category ?? '',
                status: product.status ?? 'Active',
                basePrice: product.basePrice !== undefined && product.basePrice !== null ? String(product.basePrice) : '',
                sizes: Array.isArray(product.sizes) ? product.sizes : [],
                active: Boolean(product.active),
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setSkuTouched(false);
        setErrors({});
    }, [open, product]);

    React.useEffect(() => {
        if (mode !== 'create' || skuTouched) return;
        setForm((current) => {
            if (current.sku && current.sku !== skuSuggestion) {
                return current;
            }
            return { ...current, sku: skuSuggestion };
        });
    }, [mode, skuSuggestion, skuTouched]);

    const handleChange = (field, value) => {
        if (field === 'sku') {
            setSkuTouched(true);
        }
        setForm((current) => ({ ...current, [field]: value }));
    };

    const toggleSize = (size) => {
        setForm((current) => {
            const exists = current.sizes.includes(size);
            return {
                ...current,
                sizes: exists ? current.sizes.filter((item) => item !== size) : [...current.sizes, size],
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = 'Product name is required.';
        if (!form.sku.trim()) nextErrors.sku = 'SKU is required.';
        if (!form.category) nextErrors.category = 'Category is required.';
        if (!form.status) nextErrors.status = 'Status is required.';
        if (!String(form.basePrice).trim()) nextErrors.basePrice = 'Base price is required.';
        if (Number.isNaN(Number(form.basePrice)) || Number(form.basePrice) <= 0) nextErrors.basePrice = 'Base price must be greater than zero.';
        if (!form.sizes.length) nextErrors.sizes = 'Select at least one supported size.';

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        await onSubmit({
            name: form.name.trim(),
            sku: form.sku.trim().toUpperCase(),
            description: form.description.trim(),
            category: form.category,
            status: form.status,
            basePrice: Number(form.basePrice),
            sizes: form.sizes,
            active: form.active,
        });

        if (mode === 'create') {
            setForm(EMPTY_FORM);
            setErrors({});
            setSkuTouched(false);
        }
    };

    const title = mode === 'edit' ? 'Edit Product' : 'Create Product';
    const description = mode === 'edit'
        ? 'Update catalog metadata, price, and supported manufacturing sizes.'
        : 'Add a new ERP product record with catalog, pricing, and lifecycle data.';

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            size="lg"
            footer={
                <div className="flex w-full flex-wrap justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={isSaving} form="product-form" disabled={!canSubmit}>
                        {mode === 'edit' ? 'Save Changes' : 'Create Product'}
                    </Button>
                </div>
            }
        >
            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <FormInput
                        id="product-name"
                        label="Product Name"
                        value={form.name}
                        onChange={(event) => handleChange('name', event.target.value)}
                        placeholder="e.g. Heavy-Duty Conveyor Belt"
                        error={errors.name}
                        autoComplete="off"
                    />
                    <FormInput
                        id="product-sku"
                        label="SKU"
                        value={form.sku}
                        onChange={(event) => handleChange('sku', event.target.value)}
                        placeholder="e.g. CONV-HB-1200"
                        error={errors.sku}
                        autoComplete="off"
                    />
                </div>

                {mode === 'create' && skuSuggestion ? (
                    <p className="-mt-1 text-xs text-[var(--erp-muted)]">
                        Suggested SKU: <span className="font-semibold text-[var(--erp-ink)]">{skuSuggestion}</span>
                    </p>
                ) : null}

                <Textarea
                    id="product-description"
                    label="Description"
                    value={form.description}
                    onChange={(event) => handleChange('description', event.target.value)}
                    placeholder="Describe how this product is used on the factory floor."
                    hint="Optional but recommended for operational planning."
                />

                <div className="grid gap-3 md:grid-cols-3">
                    <Select id="product-category" label="Category" value={form.category} onChange={(event) => handleChange('category', event.target.value)} error={errors.category}>
                        <option value="">Select category</option>
                        {PRODUCT_CATEGORIES.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </Select>

                    <Select id="product-status" label="Status" value={form.status} onChange={(event) => handleChange('status', event.target.value)} error={errors.status}>
                        {PRODUCT_STATUS_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </Select>

                    <FormInput
                        id="product-base-price"
                        label="Base Price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.basePrice}
                        onChange={(event) => handleChange('basePrice', event.target.value)}
                        placeholder="0.00"
                        error={errors.basePrice}
                        autoComplete="off"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--erp-muted)]">Supported Sizes</label>
                            <p className="mt-1 text-xs text-[var(--erp-muted)]">Multi-select the size variants stocked or planned for production.</p>
                        </div>
                        <span className="rounded-full border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">
                            {form.sizes.length} selected
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {PRODUCT_SIZE_OPTIONS.map((option) => {
                            const selected = form.sizes.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => toggleSize(option.value)}
                                    className={cn(
                                        'rounded-xl border px-3 py-2 text-left text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)]',
                                        selected
                                            ? 'border-[var(--erp-primary)]/40 bg-[var(--erp-primary)]/10 text-[var(--erp-primary)] ring-1 ring-[var(--erp-primary)]/20'
                                            : 'border-[var(--erp-border)] bg-[var(--erp-surface)] text-[var(--erp-ink)] hover:border-[var(--erp-muted)] hover:bg-[var(--erp-surface-muted)]',
                                    )}
                                    aria-pressed={selected}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                    {errors.sizes ? <p className="text-xs text-[var(--erp-danger)]">{errors.sizes}</p> : null}
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface-muted)] px-4 py-3">
                    <div>
                        <p className="text-sm font-medium text-[var(--erp-ink)]">Active product</p>
                        <p className="text-xs text-[var(--erp-muted)]">Active items are available for planning and downstream orders.</p>
                    </div>
                    <Switch
                        checked={form.active}
                        onChange={(checked) => handleChange('active', checked)}
                        className={cn(
                            'relative inline-flex h-7 w-12 items-center rounded-full border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--erp-primary)]',
                            form.active
                                ? 'border-[var(--erp-primary)] bg-[var(--erp-primary)]'
                                : 'border-[var(--erp-border)] bg-[var(--erp-border)]/70',
                        )}
                    >
                        <span
                            className={cn(
                                'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                                form.active ? 'translate-x-6' : 'translate-x-1',
                            )}
                        />
                    </Switch>
                </div>
            </form>
        </Modal>
    );
}
