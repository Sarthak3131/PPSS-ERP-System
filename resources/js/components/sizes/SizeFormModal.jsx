import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import { SIZE_CATEGORIES, SIZE_STATUS_OPTIONS, SIZE_UNIT_OPTIONS } from '../../data/mockSizes';
import { formatSizeMeasurementPreview } from './sizeFormatting';

const EMPTY_FORM = { sizeCode: '', displayName: '', category: '', width: '', height: '', diameter: '', unit: '', tolerance: '', notes: '', usageNotes: '', materialType: '', supplierCompatibility: '', operationalRemarks: '', status: 'Active' };

function autoSizeCode(name, category) {
    const base = `${category || ''} ${name || ''}`.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return base ? base.slice(0, 12) : '';
}

export default function SizeFormModal({ open, onClose, onSubmit, mode = 'create', size = null, isSaving = false }) {
    const [form, setForm] = React.useState(EMPTY_FORM);
    const [errors, setErrors] = React.useState({});
    const [sizeCodeTouched, setSizeCodeTouched] = React.useState(false);
    const suggestedCode = React.useMemo(() => autoSizeCode(form.displayName, form.category), [form.displayName, form.category]);
    const canSubmit = React.useMemo(() => Boolean(form.sizeCode.trim() && form.displayName.trim() && form.category && form.unit && form.tolerance && form.status), [form]);
    const dimensionsPreview = React.useMemo(() => formatSizeMeasurementPreview(form), [form]);

    React.useEffect(() => {
        if (!open) return;
        if (size) {
            setForm({ sizeCode: size.sizeCode ?? '', displayName: size.displayName ?? '', category: size.category ?? '', width: size.width ?? '', height: size.height ?? '', diameter: size.diameter ?? '', unit: size.unit ?? '', tolerance: size.tolerance ?? '', notes: size.notes ?? '', usageNotes: size.usageNotes ?? '', materialType: size.materialType ?? '', supplierCompatibility: size.supplierCompatibility ?? '', operationalRemarks: size.operationalRemarks ?? '', status: size.status ?? 'Active' });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
        setSizeCodeTouched(false);
    }, [open, size]);

    React.useEffect(() => { if (mode !== 'create' || sizeCodeTouched) return; setForm((current) => (current.sizeCode && current.sizeCode !== suggestedCode ? current : { ...current, sizeCode: suggestedCode })); }, [mode, suggestedCode, sizeCodeTouched]);

    const updateField = (field, value) => {
        if (field === 'sizeCode') setSizeCodeTouched(true);
        const nextValue = field === 'sizeCode' ? String(value || '').toUpperCase() : value;
        setForm((current) => ({ ...current, [field]: nextValue }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (!form.sizeCode.trim()) nextErrors.sizeCode = 'Size code is required.';
        if (!form.displayName.trim()) nextErrors.displayName = 'Display name is required.';
        if (!form.category) nextErrors.category = 'Category is required.';
        if (!form.unit) nextErrors.unit = 'Unit is required.';
        if (!form.tolerance.trim()) nextErrors.tolerance = 'Tolerance is required.';
        if (!form.status) nextErrors.status = 'Status is required.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        await onSubmit({ sizeCode: form.sizeCode.trim().toUpperCase(), displayName: form.displayName.trim(), category: form.category, width: form.width === '' ? null : Number(form.width), height: form.height === '' ? null : Number(form.height), diameter: form.diameter === '' ? null : Number(form.diameter), unit: form.unit, tolerance: form.tolerance.trim(), notes: form.notes.trim(), usageNotes: form.usageNotes.trim(), materialType: form.materialType.trim(), supplierCompatibility: form.supplierCompatibility.trim(), operationalRemarks: form.operationalRemarks.trim(), status: form.status });
        if (mode === 'create') { setForm(EMPTY_FORM); setErrors({}); setSizeCodeTouched(false); }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === 'edit' ? 'Edit Size' : 'Create Size'}
            description={mode === 'edit' ? 'Update size metadata and manufacturing details.' : 'Add a new size record for the ERP size matrix.'}
            size="lg"
            className="max-w-4xl"
            footer={
                <div className="flex w-full flex-wrap items-center justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={isSaving} form="size-form" disabled={!canSubmit}>
                        {mode === 'edit' ? 'Save Changes' : 'Create Size'}
                    </Button>
                </div>
            }
        >
            <form id="size-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="grid items-stretch gap-2.5 lg:grid-cols-[minmax(0,1.34fr)_minmax(0,0.66fr)]">
                    <div className="flex h-full flex-col space-y-3.5 rounded-2xl border border-(--erp-border) bg-(--erp-surface-muted)/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="text-sm font-semibold text-(--erp-ink)">Identity</h4>
                                <p className="mt-0.5 text-xs text-(--erp-muted)">Core catalog fields and code generation.</p>
                            </div>
                            <div className="flex min-h-14 items-center justify-center rounded-xl border border-(--erp-border) bg-(--erp-surface) px-3 py-1.5 text-center">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Preview</p>
                                    <p className="mt-1 text-sm font-semibold text-(--erp-ink)">{dimensionsPreview}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <FormInput id="size-code" label="Size Code" value={form.sizeCode} onChange={(e) => updateField('sizeCode', e.target.value)} error={errors.sizeCode} placeholder="M10-BLT" />
                            <FormInput id="size-display" label="Display Name" value={form.displayName} onChange={(e) => updateField('displayName', e.target.value)} error={errors.displayName} placeholder="M10 Bolt" />
                        </div>

                        {mode === 'create' && suggestedCode ? (
                            <p className="-mt-1 text-xs text-(--erp-muted)">
                                Suggested code: <span className="font-semibold text-(--erp-ink)">{suggestedCode}</span>
                            </p>
                        ) : null}

                        <div className="grid gap-3 md:grid-cols-3">
                            <Select id="size-category" label="Category" value={form.category} onChange={(e) => updateField('category', e.target.value)} error={errors.category}>
                                <option value="">Select category</option>
                                {SIZE_CATEGORIES.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </Select>

                            <Select id="size-unit" label="Unit" value={form.unit} onChange={(e) => updateField('unit', e.target.value)} error={errors.unit}>
                                <option value="">Select unit</option>
                                {SIZE_UNIT_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </Select>

                            <Select id="size-status" label="Status" value={form.status} onChange={(e) => updateField('status', e.target.value)} error={errors.status}>
                                {SIZE_STATUS_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="flex h-full flex-col space-y-3.5 rounded-2xl border border-(--erp-border) bg-(--erp-surface-muted)/40 p-4">
                        <div className="flex items-start gap-3">
                            <div>
                                <h4 className="text-sm font-semibold text-(--erp-ink)">Measurements</h4>
                                <p className="mt-0.5 text-xs text-(--erp-muted)">Keep dimensions and tolerance aligned with production usage.</p>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <FormInput id="size-width" label="Width" type="number" step="0.01" value={form.width} onChange={(e) => updateField('width', e.target.value)} placeholder="1200" />
                            <FormInput id="size-height" label="Height" type="number" step="0.01" value={form.height} onChange={(e) => updateField('height', e.target.value)} placeholder="2200" />
                            <FormInput id="size-diameter" label="Diameter" type="number" step="0.01" value={form.diameter} onChange={(e) => updateField('diameter', e.target.value)} placeholder="250" />
                        </div>

                        <FormInput id="size-tolerance" label="Tolerance" value={form.tolerance} onChange={(e) => updateField('tolerance', e.target.value)} error={errors.tolerance} placeholder="±0.10 mm" />
                        <p className="-mt-2 text-xs text-(--erp-muted)">Use the manufacturing tolerance that planners and QA can read at a glance.</p>
                    </div>
                </div>

                <div className="grid items-stretch gap-3.5 md:grid-cols-2">
                    <div className="flex h-full flex-col space-y-3.5 rounded-2xl border border-(--erp-border) bg-(--erp-surface-muted)/40 p-4">
                        <div>
                            <h4 className="text-sm font-semibold text-(--erp-ink)">Operational metadata</h4>
                            <p className="mt-0.5 text-xs text-(--erp-muted)">Keep supplier and material data visible to operations.</p>
                        </div>

                        <FormInput id="size-supplier" label="Supplier Compatibility" value={form.supplierCompatibility} onChange={(e) => updateField('supplierCompatibility', e.target.value)} placeholder="Delta Fasteners Co." />
                        <FormInput id="size-material" label="Material Type" value={form.materialType} onChange={(e) => updateField('materialType', e.target.value)} placeholder="High-tensile steel" />
                        <TextArea
                            id="size-usage-notes"
                            label="Usage Notes"
                            value={form.usageNotes}
                            onChange={(e) => updateField('usageNotes', e.target.value)}
                            placeholder="Used on structural joins with periodic inspection."
                            className="flex-1"
                            textAreaClassName="min-h-36 resize-y"
                        />
                    </div>

                    <div className="flex h-full flex-col space-y-3.5 rounded-2xl border border-(--erp-border) bg-(--erp-surface-muted)/40 p-4">
                        <div>
                            <h4 className="text-sm font-semibold text-(--erp-ink)">Remarks</h4>
                            <p className="mt-0.5 text-xs text-(--erp-muted)">Capture conditions that help production and maintenance teams.</p>
                        </div>

                        <TextArea
                            id="size-notes"
                            label="Notes"
                            value={form.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                            placeholder="Compatibility or operational notes"
                            className="flex-1"
                            textAreaClassName="min-h-36 resize-y"
                        />

                        <TextArea
                            id="size-ops"
                            label="Operational Remarks"
                            value={form.operationalRemarks}
                            onChange={(e) => updateField('operationalRemarks', e.target.value)}
                            placeholder="Track torque during installation for repeatability."
                            className="flex-1"
                            textAreaClassName="min-h-36 resize-y"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
