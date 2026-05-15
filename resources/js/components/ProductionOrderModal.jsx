import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import FormInput from './ui/FormInput';
import Select from './ui/Select';
import * as productionOrderService from '../services/productionOrderService';
import { useToast } from './ui/ToastProvider';
import { getApiErrorMessage, getFirstValidationMessage } from '../utils/apiEnvelope';

export default function ProductionOrderModal({ 
    open, 
    onClose, 
    mode = 'create', 
    order = null,
    products = [],
    sizes = [],
    onSave = null,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formData, setFormData] = useState({
        product_id: '',
        size_id: '',
        quantity: '',
        priority: 'Medium',
        start_date: '',
        due_date: '',
        estimated_hours: '',
    });
    const { push: pushToast } = useToast();

    const title =
        mode === 'create'
            ? 'Create Production Order'
            : mode === 'edit'
                ? `Edit ${order?.orderId || 'Production Order'}`
                : `View ${order?.orderId || 'Production Order'}`;

    // Initialize form data from order when editing
    useEffect(() => {
        if (mode === 'create') {
            setFormData({
                product_id: '',
                size_id: '',
                quantity: '',
                priority: 'Medium',
                start_date: '',
                due_date: '',
                estimated_hours: '',
            });
            setFormError(null);
        } else if (mode === 'edit' && order) {
            setFormData({
                product_id: order.original?.product_id || '',
                size_id: order.original?.size_id || '',
                quantity: order.original?.quantity || '',
                priority: order.original?.priority || 'Medium',
                start_date: order.original?.start_date?.split('T')[0] || '',
                due_date: order.original?.due_date?.split('T')[0] || '',
                estimated_hours: order.original?.estimated_hours || '',
            });
            setFormError(null);
        }
    }, [open, mode, order]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.product_id || !formData.size_id || !formData.quantity || !formData.priority || 
                !formData.start_date || !formData.due_date || !formData.estimated_hours) {
                setFormError('All fields are required.');
                setIsSubmitting(false);
                return;
            }

            // Validate dates
            if (new Date(formData.due_date) < new Date(formData.start_date)) {
                setFormError('Due date must be after or equal to start date.');
                setIsSubmitting(false);
                return;
            }

            const payload = {
                product_id: parseInt(formData.product_id),
                size_id: parseInt(formData.size_id),
                quantity: parseInt(formData.quantity),
                priority: formData.priority,
                start_date: formData.start_date,
                due_date: formData.due_date,
                estimated_hours: parseFloat(formData.estimated_hours),
            };

            if (mode === 'create') {
                await productionOrderService.create(payload);
                pushToast({ title: 'Success', message: 'Production order created.', tone: 'success' });
            } else {
                await productionOrderService.update(order.id, payload);
                pushToast({ title: 'Success', message: 'Production order updated.', tone: 'success' });
            }

            if (onSave) {
                onSave();
            }
            onClose();
        } catch (error) {
            const validationMessage = getFirstValidationMessage(error.response?.data?.errors);
            const message = validationMessage || getApiErrorMessage(error) || 'Failed to save production order.';
            setFormError(message);
            pushToast({ title: 'Error', message, tone: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isViewMode = mode === 'view';
    const isReadOnly = isViewMode;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description="Product, size, quantity, and schedule details for the work order."
            size="lg"
            footer={
                <>
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        {isViewMode ? 'Close' : 'Cancel'}
                    </Button>
                    {!isViewMode && (
                        <Button type="button" variant="primary" onClick={handleSubmit} loading={isSubmitting}>
                            {mode === 'create' ? 'Save Order' : 'Update Order'}
                        </Button>
                    )}
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {formError}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Select
                        id="po-product"
                        label="Product"
                        value={formData.product_id}
                        onChange={(e) => handleInputChange('product_id', e.target.value)}
                        disabled={isReadOnly || isSubmitting}
                        required
                    >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </Select>

                    <Select
                        id="po-size"
                        label="Size"
                        value={formData.size_id}
                        onChange={(e) => handleInputChange('size_id', e.target.value)}
                        disabled={isReadOnly || isSubmitting}
                        required
                    >
                        <option value="">-- Select Size --</option>
                        {sizes.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.size_name}
                            </option>
                        ))}
                    </Select>

                    <FormInput
                        id="po-quantity"
                        label="Quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        disabled={isReadOnly || isSubmitting}
                        required
                    />

                    <Select
                        id="po-priority"
                        label="Priority"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        disabled={isReadOnly || isSubmitting}
                        required
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </Select>

                    <FormInput
                        id="po-startDate"
                        label="Start Date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        disabled={isReadOnly || isSubmitting}
                        required
                    />

                    <FormInput
                        id="po-dueDate"
                        label="Due Date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                        disabled={isReadOnly || isSubmitting}
                        required
                    />

                    <FormInput
                        id="po-estimatedHours"
                        label="Estimated Hours"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.estimated_hours}
                        onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                        disabled={isReadOnly || isSubmitting}
                        required
                    />
                </div>
            </form>
        </Modal>
    );
}