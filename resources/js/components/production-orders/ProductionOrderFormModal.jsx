import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { PRODUCT_SEED } from '../../data/mockProducts';
import { PRODUCTION_ORDER_SEED } from '../../data/mockProductionOrders';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];
const STATUS_OPTIONS = ['Planned', 'Queued', 'In Production', 'Paused', 'QA Review', 'Completed', 'Archived'];
const SHIFT_OPTIONS = ['Day', 'Swing', 'Night'];

const EMPTY_FORM = {
    orderCode: '',
    productId: PRODUCT_SEED[0]?.id || '',
    bomId: '',
    quantity: '1',
    priority: 'Medium',
    machine: '',
    shift: 'Day',
    stage: 'Planned',
    status: 'Planned',
    dueDate: new Date().toISOString().slice(0, 10),
    progress: '0',
    runtimeEstimateMins: '60',
    materialReadiness: 'Pending',
    team: '',
    qaNotes: '',
    remarks: '',
};

function resolveProduct(productId) {
    return PRODUCT_SEED.find((p) => String(p.id) === String(productId)) || null;
}

export default function ProductionOrderFormModal({ open, onClose, onSubmit, mode = 'create', order = null, isSaving = false }) {
    const [form, setForm] = React.useState(EMPTY_FORM);
    const [errors, setErrors] = React.useState({});

    React.useEffect(() => {
        if (!open) return;
        if (order) {
            setForm({
                orderCode: order.orderCode || '',
                productId: order.product?.id || PRODUCT_SEED[0]?.id || '',
                bomId: order.bomRef?.id || '',
                quantity: String(order.quantity || '1'),
                priority: order.priority || 'Medium',
                machine: order.machine || '',
                shift: order.shift || 'Day',
                stage: order.stage || 'Planned',
                status: order.status || 'Planned',
                dueDate: order.dueDate ? order.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
                progress: String(order.progress || '0'),
                runtimeEstimateMins: String(order.runtimeEstimateMins || '60'),
                materialReadiness: order.materialReadiness || 'Pending',
                team: order.team || '',
                qaNotes: order.qaNotes || '',
                remarks: order.remarks || '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [open, order]);

    const handleChange = (field, value) => setForm((c) => ({ ...c, [field]: value }));

    const canSubmit = Boolean(form.productId && Number(form.quantity) > 0 && form.priority && form.status);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = {};
        if (!form.productId) nextErrors.productId = 'Product is required.';
        if (!String(form.quantity).trim() || Number(form.quantity) <= 0) nextErrors.quantity = 'Quantity must be greater than zero.';
        if (!form.priority) nextErrors.priority = 'Priority is required.';
        if (!form.status) nextErrors.status = 'Status is required.';

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        const payload = {
            orderCode: form.orderCode || undefined,
            product: resolveProduct(form.productId),
            bomRef: undefined,
            quantity: Number(form.quantity),
            priority: form.priority,
            machine: form.machine,
            shift: form.shift,
            stage: form.stage,
            status: form.status,
            dueDate: form.dueDate,
            progress: Number(form.progress) || 0,
            runtimeEstimateMins: Number(form.runtimeEstimateMins) || 0,
            materialReadiness: form.materialReadiness,
            team: form.team,
            qaNotes: form.qaNotes,
            remarks: form.remarks,
        };

        await onSubmit(payload);
    };

    const title = mode === 'edit' ? 'Edit Production Order' : 'Create Production Order';
    const description = mode === 'edit' ? 'Update production scheduling and operational metadata.' : 'Create a new manufacturing work order for scheduling.';

    return (
        <Modal open={open} onClose={onClose} title={title} description={description} size="lg" footer={(
            <div className="flex w-full flex-wrap justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSaving} form="po-form" disabled={!canSubmit}>{mode === 'edit' ? 'Save Changes' : 'Create Order'}</Button>
            </div>
        )}>
            <form id="po-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                    <FormInput id="po-order-code" label="Order Code" value={form.orderCode} onChange={(e) => handleChange('orderCode', e.target.value)} placeholder="PO-2026-0151" />

                    <Select id="po-product" label="Product" value={form.productId} onChange={(e) => handleChange('productId', e.target.value)} error={errors.productId}>
                        <option value="">Select product</option>
                        {PRODUCT_SEED.map((p) => <option key={p.id} value={p.id}>{p.name} • {p.sku}</option>)}
                    </Select>

                    <FormInput id="po-quantity" label="Quantity" type="number" min="1" value={form.quantity} onChange={(e) => handleChange('quantity', e.target.value)} error={errors.quantity} />

                    <Select id="po-priority" label="Priority" value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}>
                        {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </Select>

                    <FormInput id="po-machine" label="Machine" value={form.machine} onChange={(e) => handleChange('machine', e.target.value)} placeholder="CNC-01" />

                    <Select id="po-shift" label="Shift" value={form.shift} onChange={(e) => handleChange('shift', e.target.value)}>
                        {SHIFT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>

                    <Select id="po-stage" label="Stage" value={form.stage} onChange={(e) => handleChange('stage', e.target.value)}>
                        <option>Planned</option>
                        <option>Cutting</option>
                        <option>Assembly</option>
                        <option>Welding</option>
                        <option>Paint</option>
                        <option>QA Review</option>
                        <option>Final Test</option>
                    </Select>

                    <Select id="po-status" label="Status" value={form.status} onChange={(e) => handleChange('status', e.target.value)} error={errors.status}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>

                    <FormInput id="po-due-date" label="Due Date" type="date" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} />

                    <FormInput id="po-runtime" label="Runtime (mins)" type="number" value={form.runtimeEstimateMins} onChange={(e) => handleChange('runtimeEstimateMins', e.target.value)} />

                    <Select id="po-material-readiness" label="Material Readiness" value={form.materialReadiness} onChange={(e) => handleChange('materialReadiness', e.target.value)}>
                        <option>Pending</option>
                        <option>Partial</option>
                        <option>Ready</option>
                    </Select>

                    <FormInput id="po-team" label="Assigned Team" value={form.team} onChange={(e) => handleChange('team', e.target.value)} placeholder="Line A" />

                    <Textarea id="po-remarks" label="Production Remarks" value={form.remarks} onChange={(e) => handleChange('remarks', e.target.value)} placeholder="Notes for operators and planners" />

                    <Textarea id="po-qa-notes" label="QA Remarks" value={form.qaNotes} onChange={(e) => handleChange('qaNotes', e.target.value)} placeholder="QA inspection notes" />
                </div>
            </form>
        </Modal>
    );
}
