import React from 'react';
import { EyeIcon, PencilSquareIcon, PlusIcon, XCircleIcon, QueueListIcon, PlayCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import ProductionOrderModal from '../components/ProductionOrderModal';
import Table from '../components/Table';
import * as productionOrderService from '../services/productionOrderService';
import * as productService from '../services/productService';
import * as sizeService from '../services/sizeService';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import Select from '../components/ui/Select';
import TableToolbar from '../components/ui/TableToolbar';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { getApiErrorMessage } from '../utils/apiEnvelope';
import useAppStore from '../store/appStore';
import { useToast } from '../components/ui/ToastProvider';

const columns = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'productName', label: 'Product Name' },
    { key: 'size', label: 'Size' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'priority', label: 'Priority' },
    { key: 'supervisor', label: 'Supervisor' },
    { key: 'estimatedHours', label: 'Est. Hours' },
    {
        key: 'status',
        label: 'Status',
        render: (value) => <StatusBadge status={value} />,
    },
    { key: 'startDate', label: 'Start Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'assignedMachine', label: 'Assigned Machine' },
];

export default function ProductionOrders() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [modalMode, setModalMode] = React.useState('create');
    const [orders, setOrders] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [sizes, setSizes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [confirmModal, setConfirmModal] = React.useState({ isOpen: false, action: null, order: null });
    const { push: pushToast } = useToast();
    const logActivity = useAppStore((state) => state.logActivity);

    React.useEffect(() => {
        const handleAssignmentChange = () => {
            fetchOrders();
        };

        const handleStorageChange = (event) => {
            if (event.key === 'production-order-assignment-changed') {
                fetchOrders();
            }
        };

        window.addEventListener('production-order-assignment-changed', handleAssignmentChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('production-order-assignment-changed', handleAssignmentChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const orderRows = await productionOrderService.getAll();
            const mappedOrders = (Array.isArray(orderRows) ? orderRows : []).map((order) => ({
                id: order.id,
                orderId: order.order_number,
                productName: order.product?.name || 'Unknown',
                size: order.size?.size_name || 'N/A',
                quantity: order.quantity,
                priority: order.priority,
                supervisor: order.supervisor?.name || 'Unassigned',
                estimatedHours: order.estimated_hours,
                status: order.status,
                startDate: order.start_date,
                dueDate: order.due_date,
                assignedMachineId: order.assigned_machine_id,
                assignedMachine: order.assigned_machine?.name || 'Unassigned',
                original: order
            }));
            setOrders(mappedOrders);
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to load production orders', tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [productsRes, sizesRes] = await Promise.all([
                productService.getAll(),
                sizeService.getAll(),
            ]);
            setProducts(Array.isArray(productsRes?.data) ? productsRes.data : []);
            setSizes(Array.isArray(sizesRes?.data) ? sizesRes.data : []);
        } catch (error) {
            pushToast({ title: 'Warning', message: 'Could not load products/sizes for form', tone: 'warning' });
        }
    };

    React.useEffect(() => {
        fetchOrders();
        fetchDropdownData();
    }, []);

    const filteredOrders = React.useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                query.length === 0 ||
                [order.orderId, order.productName, order.size, order.assignedMachine, order.status]
                    .join(' ')
                    .toLowerCase()
                    .includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [orders, searchQuery, statusFilter]);

    const openCreateModal = () => {
        setSelectedOrder(null);
        setModalMode('create');
        setIsCreateModalOpen(true);
    };

    const openRowModal = (order, mode) => {
        setSelectedOrder(order);
        setModalMode(mode);
        setIsCreateModalOpen(true);
    };

    const handleConfirmAction = async () => {
        const { action, order } = confirmModal;
        try {
            if (action === 'release') {
                await productionOrderService.release(order.id);
                pushToast({ title: 'Order Released', message: `Order ${order.orderId} has been released to production.`, tone: 'success' });
                logActivity({
                    title: `Production Order ${order.orderId} released`,
                    detail: `Order for ${order.quantity} of ${order.productName} has been released.`,
                    status: 'Released'
                });
            } else if (action === 'cancel') {
                await productionOrderService.cancel(order.id);
                pushToast({ title: 'Order Cancelled', message: `Order ${order.orderId} has been cancelled.`, tone: 'warning' });
                logActivity({
                    title: `Production Order ${order.orderId} cancelled`,
                    detail: `Order for ${order.productName} was cancelled by operator.`,
                    status: 'Cancelled'
                });
            } else if (action === 'delete') {
                await productionOrderService.remove(order.id);
                pushToast({ title: 'Order Deleted', message: `Order ${order.orderId} has been deleted.`, tone: 'success' });
            }
            fetchOrders();
        } catch (error) {
            pushToast({ 
                title: 'Error', 
                message: getApiErrorMessage(error) || `Failed to ${action} order`, 
                tone: 'error' 
            });
        } finally {
            setConfirmModal({ isOpen: false, action: null, order: null });
        }
    };

    return (
        <section className="space-y-4">
            <PageHeader
                title="Production Orders"
                subtitle="ERP-level work order register with schedule, capacity, and machine assignment tracking."
            />

            <TableToolbar
                title="Work Orders"
                subtitle="Track pending, in progress, and completed production orders."
                className="gap-3"
                right={
                    <>
                        <Button type="button" variant="primary" size="sm" leftIcon={PlusIcon} onClick={openCreateModal}>
                            Create Order
                        </Button>
                        <Select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="min-w-40"
                            aria-label="Filter by status"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </Select>
                        <div className="min-w-64">
                            <FormInput
                                id="production-orders-search"
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search order, product, machine, status"
                                aria-label="Search production orders"
                            />
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={() => { setStatusFilter('All'); setSearchQuery(''); }}>
                            Reset
                        </Button>
                    </>
                }
            />

            {isLoading ? (
                <LoadingSkeleton lines={8} />
            ) : filteredOrders.length === 0 ? (
                <EmptyState
                    icon={QueueListIcon}
                    title="No production orders found"
                    description="Adjust filters or create a new work order to start scheduling."
                    action={
                        <Button type="button" variant="primary" size="sm" onClick={openCreateModal} leftIcon={PlusIcon}>
                            Create Order
                        </Button>
                    }
                />
            ) : (
                <Table
                    columns={columns}
                    data={filteredOrders}
                    rowActions={(order) => (
                        <>
                            <Button type="button" onClick={(e) => { e.stopPropagation(); openRowModal(order, 'view'); }} variant="ghost" size="sm" title="View" leftIcon={EyeIcon} aria-label={`View ${order.orderId}`} />
                            <Button type="button" onClick={(e) => { e.stopPropagation(); openRowModal(order, 'edit'); }} variant="ghost" size="sm" title="Edit" leftIcon={PencilSquareIcon} aria-label={`Edit ${order.orderId}`} />
                            <Button type="button" onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, action: 'delete', order }); }} variant="ghost" className="text-[var(--erp-danger)] hover:bg-[var(--erp-danger)]/10 hover:text-[var(--erp-danger)]" size="sm" title="Delete" leftIcon={TrashIcon} aria-label={`Delete ${order.orderId}`} />
                            <Button type="button" onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, action: 'release', order }); }} variant="ghost" className="text-[var(--erp-primary)] hover:bg-[var(--erp-primary)]/10 hover:text-[var(--erp-primary)]" size="sm" title="Release" leftIcon={PlayCircleIcon} aria-label={`Release ${order.orderId}`} />
                            <Button type="button" onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, action: 'cancel', order }); }} variant="ghost" className="text-[var(--erp-danger)] hover:bg-[var(--erp-danger)]/10 hover:text-[var(--erp-danger)]" size="sm" title="Cancel" leftIcon={XCircleIcon} aria-label={`Cancel ${order.orderId}`} />
                        </>
                    )}
                />
            )}

            <ProductionOrderModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode={modalMode}
                order={selectedOrder}
                products={products}
                sizes={sizes}
                onSave={fetchOrders}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, action: null, order: null })}
                onConfirm={handleConfirmAction}
                title={confirmModal.action === 'release' ? 'Release Order' : confirmModal.action === 'delete' ? 'Delete Order' : 'Cancel Order'}
                description={
                    confirmModal.action === 'release' 
                        ? `Are you sure you want to release order ${confirmModal.order?.orderId} to the production floor?`
                        : confirmModal.action === 'delete'
                            ? `Are you sure you want to delete order ${confirmModal.order?.orderId}? This action cannot be undone.`
                        : `Are you sure you want to cancel order ${confirmModal.order?.orderId}? This action cannot be undone.`
                }
                intent={confirmModal.action === 'release' ? 'primary' : 'danger'}
                confirmText={confirmModal.action === 'release' ? 'Release Order' : confirmModal.action === 'delete' ? 'Delete Order' : 'Cancel Order'}
            />
        </section>
    );
}
