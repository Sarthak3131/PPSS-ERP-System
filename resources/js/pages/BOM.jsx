import React from 'react';
import { CubeIcon } from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useToast } from '../components/ui/ToastProvider';
import BOMControls from '../components/bom/BOMControls';
import BOMTable from '../components/bom/BOMTable';
import BOMFormModal from '../components/bom/BOMFormModal';
import * as bomService from '../services/bomService';

const DEFAULT_ROWS_PER_PAGE = 10;

function formatPageCount(total, pageSize) {
    return Math.max(1, Math.ceil(total / pageSize));
}

function matchesQuery(node, query) {
    if (!query) return true;

    const haystack = [
        node.parentProduct?.name,
        node.parentProduct?.sku,
        node.componentName,
        node.componentCode,
        node.supplier,
        node.status,
        node.revision,
        node.notes,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(query);
}

function filterTree(nodes, query) {
    if (!query) return nodes;

    return nodes
        .map((node) => {
            const childMatches = filterTree(node.children || [], query);
            const selfMatches = matchesQuery(node, query);

            if (!selfMatches && childMatches.length === 0) {
                return null;
            }

            return selfMatches ? node : { ...node, children: childMatches };
        })
        .filter(Boolean);
}

export default function BOM() {
    const [boms, setBoms] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [rowsPerPage, setRowsPerPage] = React.useState(DEFAULT_ROWS_PER_PAGE);
    const [page, setPage] = React.useState(1);
    const [expandedIds, setExpandedIds] = React.useState({});
    const [formModal, setFormModal] = React.useState({ open: false, mode: 'create', bom: null });
    const [deleteModal, setDeleteModal] = React.useState({ open: false, bom: null });
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { push: pushToast } = useToast();

    const fetchBOMs = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await bomService.getAllBOMs();
            setBoms(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            setBoms([]);
            pushToast({ title: 'Error', message: 'Failed to load bill of materials.', tone: 'error' });
        } finally {
            setLoading(false);
        }
    }, [pushToast]);

    React.useEffect(() => {
        fetchBOMs();
    }, [fetchBOMs]);

    const filteredBOMs = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return filterTree(boms, query);
    }, [boms, searchQuery]);

    const totalPages = formatPageCount(filteredBOMs.length, rowsPerPage);
    const safePage = Math.min(page, totalPages);

    React.useEffect(() => {
        setPage(1);
    }, [searchQuery, rowsPerPage]);

    React.useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const paginatedBOMs = React.useMemo(() => {
        const startIndex = (safePage - 1) * rowsPerPage;
        return filteredBOMs.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredBOMs, safePage, rowsPerPage]);

    const rangeStart = filteredBOMs.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
    const rangeEnd = Math.min(safePage * rowsPerPage, filteredBOMs.length);
    const rangeLabel = `Showing ${rangeStart}–${rangeEnd} of ${filteredBOMs.length} BOMs`;

    const toggleExpand = (id) => {
        setExpandedIds((current) => ({ ...current, [id]: !current[id] }));
    };

    const openCreateModal = () => {
        setFormModal({ open: true, mode: 'create', bom: null });
    };

    const openEditModal = (bom) => {
        setFormModal({ open: true, mode: 'edit', bom });
    };

    const openDeleteModal = (bom) => {
        setDeleteModal({ open: true, bom });
    };

    const resetFilters = () => {
        setSearchQuery('');
        setRowsPerPage(DEFAULT_ROWS_PER_PAGE);
        setPage(1);
    };

    const handleSaveBOM = async (payload) => {
        setIsSaving(true);
        try {
            if (formModal.mode === 'edit' && formModal.bom) {
                await bomService.updateBOM(formModal.bom.id, payload);
                pushToast({ title: 'BOM updated', message: `${payload.componentName} was updated successfully.`, tone: 'success' });
            } else {
                await bomService.createBOM(payload);
                pushToast({ title: 'BOM created', message: `${payload.componentName} was added to the BOM library.`, tone: 'success' });
            }

            setFormModal({ open: false, mode: 'create', bom: null });
            await fetchBOMs();
        } catch (error) {
            pushToast({ title: 'Save failed', message: error?.message || 'Unable to save BOM record.', tone: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBOM = async () => {
        if (!deleteModal.bom) return;

        setIsDeleting(true);
        try {
            await bomService.deleteBOM(deleteModal.bom.id);
            pushToast({ title: 'BOM deleted', message: `${deleteModal.bom.componentName} was removed from the tree.`, tone: 'success' });
            await fetchBOMs();
        } catch (error) {
            pushToast({ title: 'Delete failed', message: error?.message || 'Unable to delete BOM record.', tone: 'error' });
        } finally {
            setIsDeleting(false);
            setDeleteModal({ open: false, bom: null });
        }
    };

    return (
        <section className="space-y-4 pb-12">
            <PageHeader
                title="Bill of Materials"
                subtitle="Mock-managed manufacturing BOMs linked to the product catalog for ERP-style portfolio demos."
            />

            {loading ? (
                <LoadingSkeleton lines={8} />
            ) : (
                <div className="space-y-3">
                    <BOMControls
                        search={searchQuery}
                        onSearchChange={setSearchQuery}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={setRowsPerPage}
                        onReset={resetFilters}
                        onCreate={openCreateModal}
                    />

                    {filteredBOMs.length === 0 ? (
                        <div className="erp-panel overflow-hidden p-0">
                            <div className="flex min-h-72 items-center justify-center px-4 py-8">
                                <EmptyState
                                    icon={CubeIcon}
                                    title="No BOM records"
                                    description="Create a bill of materials to link products with nested components, revisions, and supplier details."
                                    action={<Button type="button" variant="secondary" size="sm" onClick={openCreateModal}>Create BOM</Button>}
                                    className="mx-auto max-w-2xl py-6"
                                />
                            </div>
                        </div>
                    ) : (
                        <BOMTable
                            boms={paginatedBOMs}
                            expandedIds={expandedIds}
                            onToggleExpand={toggleExpand}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                            page={safePage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            rangeLabel={rangeLabel}
                        />
                    )}
                </div>
            )}

            <BOMFormModal
                open={formModal.open}
                onClose={() => setFormModal({ open: false, mode: 'create', bom: null })}
                onSubmit={handleSaveBOM}
                mode={formModal.mode}
                bom={formModal.bom}
                isSaving={isSaving}
            />

            <ConfirmationModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, bom: null })}
                onConfirm={handleDeleteBOM}
                title="Delete BOM Line"
                description={`Delete ${deleteModal.bom?.componentName || 'this BOM line'} from the local mock tree? This action cannot be undone.`}
                intent="danger"
                confirmText="Delete BOM Line"
                isLoading={isDeleting}
            />
        </section>
    );
}
