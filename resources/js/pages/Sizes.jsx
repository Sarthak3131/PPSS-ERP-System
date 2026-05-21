import React from 'react';
import { CubeIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useToast } from '../components/ui/ToastProvider';
import SizeControls from '../components/sizes/SizeControls';
import SizeBulkActionsToolbar from '../components/sizes/SizeBulkActionsToolbar';
import SizeDetailsModal from '../components/sizes/SizeDetailsModal';
import SizeFormModal from '../components/sizes/SizeFormModal';
import SizeTable from '../components/sizes/SizeTable';
import SizeTableSkeleton from '../components/sizes/SizeTableSkeleton';
import * as sizeService from '../services/sizeService';
import { SIZE_CATEGORIES, SIZE_STATUS_OPTIONS, SIZE_UNIT_OPTIONS } from '../data/mockSizes';
import { getApiErrorMessage } from '../utils/apiEnvelope';

function formatPageCount(total, pageSize) { return Math.max(1, Math.ceil(total / pageSize)); }

export default function Sizes() {
    const [sizes, setSizes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('All');
    const [statusFilter, setStatusFilter] = React.useState('All');
    const [unitFilter, setUnitFilter] = React.useState('All');
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [page, setPage] = React.useState(1);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [sortState, setSortState] = React.useState({ key: 'updatedAt', direction: 'desc' });
    const [formModal, setFormModal] = React.useState({ open: false, mode: 'create', size: null });
    const [detailsModal, setDetailsModal] = React.useState({ open: false, size: null });
    const [deleteModal, setDeleteModal] = React.useState({ open: false, size: null });
    const [bulkDeleteModal, setBulkDeleteModal] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isBulkSaving, setIsBulkSaving] = React.useState(false);
    const { push: pushToast } = useToast();

    const fetchSizes = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await sizeService.getAll();
            setSizes(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            setSizes([]);
            pushToast({ title: 'Error', message: 'Failed to load sizes.', tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [pushToast]);

    React.useEffect(() => { fetchSizes(); }, [fetchSizes]);

    const filteredSizes = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return sizes.filter((size) => {
            const matchesCategory = categoryFilter === 'All' || size.category === categoryFilter;
            const matchesStatus = statusFilter === 'All' || size.status === statusFilter;
            const matchesUnit = unitFilter === 'All' || size.unit === unitFilter;
            const matchesSearch = query.length === 0 || [size.sizeCode, size.displayName, size.category, size.unit, size.notes, size.supplierCompatibility].join(' ').toLowerCase().includes(query);
            return matchesCategory && matchesStatus && matchesUnit && matchesSearch;
        });
    }, [sizes, searchQuery, categoryFilter, statusFilter, unitFilter]);

    const sortedSizes = React.useMemo(() => {
        const list = [...filteredSizes];
        const { key, direction } = sortState;
        list.sort((a, b) => {
            const comparison = String(a?.[key] ?? '').localeCompare(String(b?.[key] ?? ''), undefined, { numeric: true, sensitivity: 'base' });
            return direction === 'asc' ? comparison : -comparison;
        });
        return list;
    }, [filteredSizes, sortState]);

    const totalPages = formatPageCount(sortedSizes.length, rowsPerPage);
    const safePage = Math.min(page, totalPages);

    React.useEffect(() => { setPage(1); }, [searchQuery, categoryFilter, statusFilter, unitFilter, rowsPerPage]);
    React.useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
    React.useEffect(() => { setSelectedIds((current) => current.filter((id) => sizes.some((size) => size.id === id))); }, [sizes]);

    const paginatedSizes = React.useMemo(() => {
        const startIndex = (safePage - 1) * rowsPerPage;
        return sortedSizes.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedSizes, safePage, rowsPerPage]);

    const selectedOnPageCount = React.useMemo(() => selectedIds.filter((id) => paginatedSizes.some((size) => size.id === id)).length, [selectedIds, paginatedSizes]);

    const rangeStart = sortedSizes.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
    const rangeEnd = Math.min(safePage * rowsPerPage, sortedSizes.length);
    const rangeLabel = `Showing ${rangeStart}–${rangeEnd} of ${sortedSizes.length} sizes`;

    const openCreateModal = () => setFormModal({ open: true, mode: 'create', size: null });
    const openEditModal = (size) => setFormModal({ open: true, mode: 'edit', size });
    const openDetailsModal = (size) => setDetailsModal({ open: true, size });
    const openDeleteModal = (size) => setDeleteModal({ open: true, size });
    const clearSelection = () => setSelectedIds([]);
    const resetFilters = () => { setSearchQuery(''); setCategoryFilter('All'); setStatusFilter('All'); setUnitFilter('All'); };

    const handleSaveSize = async (payload) => {
        setIsSaving(true);
        try {
            if (formModal.mode === 'edit' && formModal.size) {
                await sizeService.update(formModal.size.id, payload);
                pushToast({ title: 'Size updated', message: `${payload.displayName} was updated successfully.`, tone: 'success' });
            } else {
                await sizeService.create(payload);
                pushToast({ title: 'Size created', message: `${payload.displayName} was added to the catalog.`, tone: 'success' });
            }
            setFormModal({ open: false, mode: 'create', size: null });
            await fetchSizes();
        } catch (error) {
            pushToast({ title: 'Save failed', message: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSize = async () => {
        if (!deleteModal.size) return;
        setIsDeleting(true);
        try {
            await sizeService.remove(deleteModal.size.id);
            setSelectedIds((current) => current.filter((id) => id !== deleteModal.size.id));
            pushToast({ title: 'Size deleted', message: `${deleteModal.size.displayName} was removed from the catalog.`, tone: 'success' });
            await fetchSizes();
        } catch (error) {
            pushToast({ title: 'Delete failed', message: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsDeleting(false);
            setDeleteModal({ open: false, size: null });
        }
    };

    const handleDuplicateSize = async (size) => {
        try {
            const duplicated = await sizeService.duplicate(size.id);
            pushToast({ title: 'Size duplicated', message: `${duplicated.displayName} was created from ${size.displayName}.`, tone: 'success' });
            await fetchSizes();
        } catch (error) {
            pushToast({ title: 'Duplicate failed', message: getApiErrorMessage(error), tone: 'error' });
        }
    };

    const handleArchiveSize = async (size) => {
        try {
            const archived = await sizeService.archive(size.id);
            pushToast({ title: 'Size archived', message: `${archived.displayName} moved to Archived.`, tone: 'success' });
            await fetchSizes();
        } catch (error) {
            pushToast({ title: 'Archive failed', message: getApiErrorMessage(error), tone: 'error' });
        }
    };

    const handleBulkArchive = async () => {
        if (selectedIds.length === 0) return;
        setIsBulkSaving(true);
        try {
            await sizeService.bulkArchive(selectedIds);
            pushToast({ title: 'Bulk archive complete', message: `${selectedIds.length} sizes archived.`, tone: 'success' });
            clearSelection();
            await fetchSizes();
        } catch (error) {
            pushToast({ title: 'Bulk archive failed', message: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsBulkSaving(false);
        }
    };

    const handleBulkDelete = () => { if (selectedIds.length > 0) setBulkDeleteModal(true); };
    const confirmBulkDelete = async () => {
        setIsBulkSaving(true);
        try {
            await sizeService.bulkRemove(selectedIds);
            pushToast({ title: 'Bulk delete complete', message: `${selectedIds.length} sizes removed.`, tone: 'success' });
            clearSelection();
            await fetchSizes();
        } catch (error) {
            pushToast({ title: 'Bulk delete failed', message: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsBulkSaving(false);
            setBulkDeleteModal(false);
        }
    };

    const handleToggleSelect = (id, checked) => setSelectedIds((current) => (checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)));
    const handleToggleSelectAll = (checked) => { const visibleIds = paginatedSizes.map((size) => size.id); setSelectedIds((current) => (checked ? Array.from(new Set([...current, ...visibleIds])) : current.filter((id) => !visibleIds.includes(id)))); };
    const handleSort = (key) => setSortState((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));

    return (
        <section className="space-y-4">
            <PageHeader title="Sizes" subtitle="Enterprise size matrix with lifecycle status, dimensions, and linked product visibility." actions={<Button type="button" variant="primary" size="sm" leftIcon={PlusIcon} onClick={openCreateModal}>Create Size</Button>} />
            <SizeControls search={searchQuery} onSearchChange={setSearchQuery} category={categoryFilter} onCategoryChange={setCategoryFilter} status={statusFilter} onStatusChange={setStatusFilter} unit={unitFilter} onUnitChange={setUnitFilter} rowsPerPage={rowsPerPage} onRowsPerPageChange={setRowsPerPage} categories={SIZE_CATEGORIES} statuses={SIZE_STATUS_OPTIONS} units={SIZE_UNIT_OPTIONS} onReset={resetFilters} />

            {isLoading ? <SizeTableSkeleton /> : sizes.length === 0 ? (
                <EmptyState icon={CubeIcon} title="No sizes in the catalog" description="Create the first size record to begin the manufacturing size matrix." action={<Button type="button" variant="secondary" size="sm" onClick={openCreateModal} leftIcon={PlusIcon}>Create Size</Button>} />
            ) : sortedSizes.length === 0 ? (
                <EmptyState icon={searchQuery ? MagnifyingGlassIcon : FunnelIcon} title={searchQuery || categoryFilter !== 'All' || statusFilter !== 'All' || unitFilter !== 'All' ? 'No filtered matches' : 'No sizes'} description={searchQuery || categoryFilter !== 'All' || statusFilter !== 'All' || unitFilter !== 'All' ? 'Adjust the search or filters to reveal sizes in the catalog.' : 'Create the first size record to begin the manufacturing size matrix.'} action={<div className="flex items-center gap-2"><Button type="button" variant="secondary" size="sm" onClick={resetFilters}>Reset Filters</Button><Button type="button" variant="secondary" size="sm" onClick={openCreateModal} leftIcon={PlusIcon}>Create Size</Button></div>} />
            ) : (
                <div className="space-y-3">
                    <SizeBulkActionsToolbar selectedCount={selectedIds.length} onArchive={handleBulkArchive} onDelete={handleBulkDelete} onClear={clearSelection} />
                    <div className="erp-panel px-4 py-3 text-sm text-(--erp-muted)"><span className="font-semibold text-(--erp-ink)">{selectedOnPageCount}</span> selected on this page</div>
                    <SizeTable sizes={paginatedSizes} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} onToggleSelectAll={handleToggleSelectAll} onView={openDetailsModal} onEdit={openEditModal} onDuplicate={handleDuplicateSize} onArchive={handleArchiveSize} onDelete={openDeleteModal} page={safePage} totalPages={totalPages} onPageChange={setPage} rangeLabel={rangeLabel} sortState={sortState} onSort={handleSort} />
                </div>
            )}

            <SizeFormModal open={formModal.open} onClose={() => setFormModal({ open: false, mode: 'create', size: null })} onSubmit={handleSaveSize} mode={formModal.mode} size={formModal.size} isSaving={isSaving} />
            <SizeDetailsModal open={detailsModal.open} onClose={() => setDetailsModal({ open: false, size: null })} size={detailsModal.size} onEdit={() => detailsModal.size && openEditModal(detailsModal.size)} onArchive={() => detailsModal.size && handleArchiveSize(detailsModal.size)} onDelete={() => detailsModal.size && openDeleteModal(detailsModal.size)} />
            <ConfirmationModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, size: null })} onConfirm={handleDeleteSize} title="Delete Size" description={`Delete ${deleteModal.size?.displayName || 'this size'} from the catalog? This action cannot be undone.`} intent="danger" confirmText="Delete Size" isLoading={isDeleting} />
            <ConfirmationModal isOpen={bulkDeleteModal} onClose={() => setBulkDeleteModal(false)} onConfirm={confirmBulkDelete} title="Bulk Delete Sizes" description={`Delete ${selectedIds.length} selected sizes from the catalog? This action cannot be undone.`} intent="danger" confirmText="Delete Selected" isLoading={isBulkSaving} />
        </section>
    );
}

