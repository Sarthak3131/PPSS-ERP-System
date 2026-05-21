import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { PRODUCT_SEED } from '../../data/mockProducts';

const UNIT_OPTIONS = ['EA', 'KIT', 'SET', 'PACK', 'ROLL', 'M', 'MM', 'KG', 'L'];
const STATUS_OPTIONS = ['Draft', 'Active', 'In Production', 'Archived'];

const EMPTY_FORM = {
    parentProductId: PRODUCT_SEED[0]?.id || '',
    componentName: '',
    componentCode: '',
    quantity: '1',
    unit: 'EA',
    status: 'Draft',
    revision: 'A',
    supplier: '',
    notes: '',
};

function resolveParentProduct(parentProductId) {
    return PRODUCT_SEED.find((item) => String(item.id) === String(parentProductId)) || null;
}

export default function BOMFormModal({ open, onClose, onSubmit, mode = 'create', bom = null, isSaving = false }) {
    const [form, setForm] = React.useState(EMPTY_FORM);
    const [errors, setErrors] = React.useState({});

    React.useEffect(() => {
        if (!open) return;

        if (bom) {
            setForm({
                parentProductId: bom.parentProduct?.id || PRODUCT_SEED[0]?.id || '',
                componentName: bom.componentName ?? '',
                componentCode: bom.componentCode ?? '',
                quantity: String(bom.quantity ?? '1'),
                unit: bom.unit ?? 'EA',
                status: bom.status ?? 'Draft',
                revision: bom.revision ?? 'A',
                supplier: bom.supplier ?? '',
                notes: bom.notes ?? '',
            });
        } else {
            setForm(EMPTY_FORM);
        }

        setErrors({});
    }, [open, bom]);

    const handleChange = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const canSubmit = Boolean(
        form.parentProductId &&
            form.componentName.trim() &&
            form.componentCode.trim() &&
            Number(form.quantity) > 0 &&
            form.unit &&
            form.status &&
            form.revision.trim(),
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        const nextErrors = {};
        if (!form.parentProductId) nextErrors.parentProductId = 'Parent product is required.';
        if (!form.componentName.trim()) nextErrors.componentName = 'Component name is required.';
        if (!form.componentCode.trim()) nextErrors.componentCode = 'Component code is required.';
        if (!String(form.quantity).trim() || Number(form.quantity) <= 0) nextErrors.quantity = 'Quantity must be greater than zero.';
        if (!form.unit) nextErrors.unit = 'Unit is required.';
        if (!form.status) nextErrors.status = 'Status is required.';
        if (!form.revision.trim()) nextErrors.revision = 'Revision is required.';

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const parentProduct = resolveParentProduct(form.parentProductId);

        await onSubmit({
            parentProduct,
            componentName: form.componentName.trim(),
            componentCode: form.componentCode.trim().toUpperCase(),
            quantity: Number(form.quantity),
            unit: form.unit,
            status: form.status,
            revision: form.revision.trim().toUpperCase(),
            supplier: form.supplier.trim(),
            notes: form.notes.trim(),
            level: bom?.level ?? 0,
            children: bom?.children || [],
        });

        if (mode === 'create') {
            setForm(EMPTY_FORM);
            setErrors({});
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === 'edit' ? 'Edit BOM Line' : 'Create BOM'}
            description={mode === 'edit' ? 'Update manufacturing line metadata and revision details.' : 'Create a new BOM record linked to an existing product.'}
            size="lg"
            className="max-w-4xl"
            footer={(
                <div className="flex w-full flex-wrap justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={isSaving} form="bom-form" disabled={!canSubmit}>
                        {mode === 'edit' ? 'Save Changes' : 'Create BOM'}
                    </Button>
                </div>
            )}
        >
            <form id="bom-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <Select id="bom-parent-product" label="Parent Product" value={form.parentProductId} onChange={(event) => handleChange('parentProductId', event.target.value)} error={errors.parentProductId}>
                            <option value="">Select product</option>
                            {PRODUCT_SEED.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} • {product.sku}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <FormInput id="bom-component-name" label="Component Name" value={form.componentName} onChange={(event) => handleChange('componentName', event.target.value)} error={errors.componentName} placeholder="Motor Mount Plate" />
                    <FormInput id="bom-component-code" label="Component Code" value={form.componentCode} onChange={(event) => handleChange('componentCode', event.target.value.toUpperCase())} error={errors.componentCode} placeholder="BOM-MTR-021" />

                    <FormInput id="bom-quantity" label="Quantity" type="number" min="1" step="1" value={form.quantity} onChange={(event) => handleChange('quantity', event.target.value)} error={errors.quantity} placeholder="1" />
                    <Select id="bom-unit" label="Unit" value={form.unit} onChange={(event) => handleChange('unit', event.target.value)} error={errors.unit}>
                        <option value="">Select unit</option>
                        {UNIT_OPTIONS.map((unit) => (
                            <option key={unit} value={unit}>
                                {unit}
                            </option>
                        ))}
                    </Select>

                    <Select id="bom-status" label="Status" value={form.status} onChange={(event) => handleChange('status', event.target.value)} error={errors.status}>
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </Select>
                    <FormInput id="bom-revision" label="Revision" value={form.revision} onChange={(event) => handleChange('revision', event.target.value.toUpperCase())} error={errors.revision} placeholder="A" />

                    <div className="md:col-span-2">
                        <FormInput id="bom-supplier" label="Supplier" value={form.supplier} onChange={(event) => handleChange('supplier', event.target.value)} placeholder="Apex Hydraulics Pvt. Ltd." />
                    </div>

                    <div className="md:col-span-2">
                        <Textarea id="bom-notes" label="Notes" value={form.notes} onChange={(event) => handleChange('notes', event.target.value)} placeholder="Revision notes, inspection details, or special handling instructions." />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
