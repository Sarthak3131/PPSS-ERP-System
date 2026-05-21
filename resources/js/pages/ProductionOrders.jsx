import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useToast } from '../components/ui/ToastProvider';
import ProductionOrdersControls from '../components/production-orders/ProductionOrdersControls';
import ProductionOrderTable from '../components/production-orders/ProductionOrderTable';
import ProductionOrderFormModal from '../components/production-orders/ProductionOrderFormModal';
import * as productionOrderService from '../services/productionOrderService';

const DEFAULT_ROWS_PER_PAGE = 10;

function formatPageCount(total, pageSize) {
    return Math.max(1, Math.ceil(total / pageSize));
}

function matchesQuery(order, query) {
    if (!query) return true;
    const hay = [order.orderCode, order.product?.name, order.product?.sku, order.machine, order.stage, order.team, order.remarks].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(query);
}

export default function ProductionOrders() {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [rowsPerPage, setRowsPerPage] = React.useState(DEFAULT_ROWS_PER_PAGE);
    const [page, setPage] = React.useState(1);
    const [expandedIds, setExpandedIds] = React.useState({});
    const [formModal, setFormModal] = React.useState({ open: false, mode: 'create', order: null });
    const [deleteModal, setDeleteModal] = React.useState({ open: false, order: null });
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { push: pushToast } = useToast();

    const fetchOrders = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await productionOrderService.getAllProductionOrders();
            setOrders(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            setOrders([]);
            pushToast({ title: 'Error', message: 'Failed to load production orders.', tone: 'error' });
        } finally {
            setLoading(false);
        }
    }, [pushToast]);

    React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = React.useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return orders.filter((o) => matchesQuery(o, q));
    }, [orders, searchQuery]);

    const totalPages = formatPageCount(filtered.length, rowsPerPage);
    const safePage = Math.min(page, totalPages);

    React.useEffect(() => { setPage(1); }, [searchQuery, rowsPerPage]);
    React.useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

    const paginated = React.useMemo(() => {
        const start = (safePage - 1) * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, safePage, rowsPerPage]);

    const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
    const rangeEnd = Math.min(safePage * rowsPerPage, filtered.length);
    const rangeLabel = `Showing ${rangeStart}–${rangeEnd} of ${filtered.length} production orders`;

    const toggleExpand = (id) => setExpandedIds((c) => ({ ...c, [id]: !c[id] }));

    const openCreate = () => setFormModal({ open: true, mode: 'create', order: null });
    const openEdit = (order) => setFormModal({ open: true, mode: 'edit', order });
    const openDelete = (order) => setDeleteModal({ open: true, order });

    const resetFilters = () => { setSearchQuery(''); setRowsPerPage(DEFAULT_ROWS_PER_PAGE); setPage(1); };

    const handleSave = async (payload) => {
        setIsSaving(true);
        try {
            if (formModal.mode === 'edit' && formModal.order) {
                await productionOrderService.updateOrder(formModal.order.id, payload);
                pushToast({ title: 'Order updated', message: `${payload.orderCode || 'Order'} updated.`, tone: 'success' });
            } else {
                await productionOrderService.createOrder(payload);
                pushToast({ title: 'Order created', message: `${payload.orderCode || 'Order'} created.`, tone: 'success' });
            }

            setFormModal({ open: false, mode: 'create', order: null });
            await fetchOrders();
        } catch (err) {
            pushToast({ title: 'Save failed', message: err?.message || 'Unable to save order.', tone: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.order) return;
        setIsDeleting(true);
        try {
            await productionOrderService.deleteOrder(deleteModal.order.id);
            pushToast({ title: 'Order deleted', message: `${deleteModal.order.orderCode} removed.`, tone: 'success' });
            await fetchOrders();
        } catch (err) {
            pushToast({ title: 'Delete failed', message: err?.message || 'Unable to delete order.', tone: 'error' });
        } finally {
            setIsDeleting(false);
            setDeleteModal({ open: false, order: null });
        }
    };

    return (
        <section className="space-y-4 pb-12">
            <PageHeader title="Production Orders" subtitle="Manage manufacturing work orders, machines, shifts and execution metadata." icon={CogIcon} />

            {loading ? (
                <LoadingSkeleton lines={8} />
            ) : (
                <div className="space-y-3">
                    <ProductionOrdersControls search={searchQuery} onSearchChange={setSearchQuery} rowsPerPage={rowsPerPage} onRowsPerPageChange={setRowsPerPage} onReset={resetFilters} onCreate={openCreate} />

                    {filtered.length === 0 ? (
                        <div className="erp-panel overflow-hidden p-0">
                            <div className="flex min-h-72 items-center justify-center px-4 py-8">
                                <EmptyState
                                    icon={CogIcon}
                                    title="No production orders"
                                    description="No production orders scheduled. Create a work order to begin manufacturing planning."
                                    action={<Button type="button" variant="secondary" size="sm" onClick={openCreate}>Create Order</Button>}
                                    className="mx-auto max-w-2xl py-6"
                                />
                            </div>
                        </div>
                    ) : (
                        <ProductionOrderTable orders={paginated} expandedIds={expandedIds} onToggleExpand={toggleExpand} onEdit={openEdit} onDelete={openDelete} page={safePage} totalPages={totalPages} onPageChange={setPage} rangeLabel={rangeLabel} />
                    )}
                </div>
            )}

            <ProductionOrderFormModal open={formModal.open} onClose={() => setFormModal({ open: false, mode: 'create', order: null })} onSubmit={handleSave} mode={formModal.mode} order={formModal.order} isSaving={isSaving} />

            <ConfirmationModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, order: null })} onConfirm={handleDelete} title="Delete production order" description={`Delete ${deleteModal.order?.orderCode || 'this order'}? This action cannot be undone.`} intent="danger" confirmText="Delete Order" isLoading={isDeleting} />
        </section>
    );
}
