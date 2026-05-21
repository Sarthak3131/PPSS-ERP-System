import React from 'react';
import { CubeIcon, MagnifyingGlassIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useToast } from '../components/ui/ToastProvider';
import ProductControls from '../components/products/ProductControls';
import ProductBulkActionsToolbar from '../components/products/ProductBulkActionsToolbar';
import ProductDetailsModal from '../components/products/ProductDetailsModal';
import ProductFormModal from '../components/products/ProductFormModal';
import ProductTable from '../components/products/ProductTable';
import ProductTableSkeleton from '../components/products/ProductTableSkeleton';
import * as productService from '../services/productService';
import { PRODUCT_CATEGORIES, PRODUCT_STATUS_OPTIONS } from '../data/mockProducts';
import { getApiErrorMessage } from '../utils/apiEnvelope';

const PAGE_SIZE = 5;

function formatPageCount(total, pageSize) {
    return Math.max(1, Math.ceil(total / pageSize));
}

export default function Products() {
    const [products, setProducts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');
    const [categoryFilter, setCategoryFilter] = React.useState('All');
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [formModal, setFormModal] = React.useState({ open: false, mode: 'create', product: null });
    const [detailsModal, setDetailsModal] = React.useState({ open: false, product: null });
    const [deleteModal, setDeleteModal] = React.useState({ open: false, product: null });
    const [bulkDeleteModal, setBulkDeleteModal] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isBulkSaving, setIsBulkSaving] = React.useState(false);
    const { push: pushToast } = useToast();

    const fetchProducts = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await productService.getAll();
            setProducts(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            setProducts([]);
            pushToast({ title: 'Error', message: 'Failed to load product catalog.', tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [pushToast]);

    React.useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return products.filter((product) => {
            const matchesStatus = statusFilter === 'All' || product.status === statusFilter;
            const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
            const matchesSearch =
                query.length === 0 ||
                [product.name, product.sku, product.category, product.status]
                    .join(' ')
                    .toLowerCase()
                    .includes(query);

            return matchesStatus && matchesCategory && matchesSearch;
        });
    }, [products, searchQuery, statusFilter, categoryFilter]);

    const totalPages = formatPageCount(filteredProducts.length, rowsPerPage);
    const safePage = Math.min(page, totalPages);

    React.useEffect(() => {
        setPage(1);
    }, [searchQuery, statusFilter, categoryFilter]);

    React.useEffect(() => {
        setPage(1);
    }, [rowsPerPage]);

    React.useEffect(() => {
        setSelectedIds((current) => current.filter((id) => products.some((product) => product.id === id)));
    }, [products]);

    React.useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const paginatedProducts = React.useMemo(() => {
        const startIndex = (safePage - 1) * rowsPerPage;
        return filteredProducts.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredProducts, safePage, rowsPerPage]);

    const openCreateModal = () => {
        setFormModal({ open: true, mode: 'create', product: null });
    };

    const openEditModal = (product) => {
        setFormModal({ open: true, mode: 'edit', product });
        setDetailsModal({ open: false, product: null });
    };

    const openDetailsModal = (product) => {
        setDetailsModal({ open: true, product });
    };

    const openDeleteModal = (product) => {
        setDeleteModal({ open: true, product });
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('All');
        setCategoryFilter('All');
    };

    const handleSaveProduct = async (payload) => {
        setIsSaving(true);
        try {
            if (formModal.mode === 'edit' && formModal.product) {
                await productService.update(formModal.product.id, payload);
                pushToast({ title: 'Product updated', message: `${payload.name} was updated successfully.`, tone: 'success' });
            } else {
                await productService.create(payload);
                pushToast({ title: 'Product created', message: `${payload.name} was added to the catalog.`, tone: 'success' });
            }

            setFormModal({ open: false, mode: 'create', product: null });
            await fetchProducts();
        } catch (error) {
            pushToast({ title: 'Save failed', message: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!deleteModal.product) return;

        setIsDeleting(true);
        try {
            await productService.remove(deleteModal.product.id);
            setSelectedIds((current) => current.filter((id) => id !== deleteModal.product.id));
            pushToast({ title: 'Product deleted', message: `${deleteModal.product.name} was removed from the catalog.`, tone: 'success' });
            await fetchProducts();
        } catch (error) {
            pushToast({ title: 'Delete failed', message: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsDeleting(false);
            setDeleteModal({ open: false, product: null });
        }
    };

    const handleDuplicateProduct = async (product) => {
        try {
            const duplicated = await productService.duplicate(product.id);
            pushToast({ title: 'Product duplicated', message: `${duplicated.name} was created from ${product.name}.`, tone: 'success' });
            await fetchProducts();
        } catch (error) {
            pushToast({ title: 'Duplicate failed', message: getApiErrorMessage(error), tone: 'error' });
        }
    };

    const handleArchiveProduct = async (product) => {
        try {
            const archived = await productService.archive(product.id);
            pushToast({ title: 'Product archived', message: `${archived.name} moved to Archived.`, tone: 'success' });
            await fetchProducts();
        } catch (error) {
            pushToast({ title: 'Archive failed', message: getApiErrorMessage(error), tone: 'error' });
        }
    };

    const handleBulkArchive = async () => {
        if (selectedIds.length === 0) return;
        setIsBulkSaving(true);
        try {
            await productService.bulkArchive(selectedIds);
            pushToast({ title: 'Bulk archive complete', message: `${selectedIds.length} products archived.`, tone: 'success' });
            clearSelection();
            await fetchProducts();
        } catch (error) {
            pushToast({ title: 'Bulk archive failed', message: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsBulkSaving(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setBulkDeleteModal(true);
    };

    const confirmBulkDelete = async () => {
        setIsBulkSaving(true);
        try {
            await productService.bulkRemove(selectedIds);
            pushToast({ title: 'Bulk delete complete', message: `${selectedIds.length} products removed.`, tone: 'success' });
            clearSelection();
            await fetchProducts();
        } catch (error) {
            pushToast({ title: 'Bulk delete failed', message: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsBulkSaving(false);
            setBulkDeleteModal(false);
        }
    };

    const handleToggleSelect = (id, checked) => {
        setSelectedIds((current) => {
            if (checked) return Array.from(new Set([...current, id]));
            return current.filter((item) => item !== id);
        });
    };

    const handleToggleSelectAll = (checked) => {
        const visibleIds = paginatedProducts.map((product) => product.id);
        setSelectedIds((current) => {
            if (checked) {
                return Array.from(new Set([...current, ...visibleIds]));
            }
            return current.filter((id) => !visibleIds.includes(id));
        });
    };

    const rangeStart = filteredProducts.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
    const rangeEnd = Math.min(safePage * rowsPerPage, filteredProducts.length);
    const rangeLabel = `Showing ${rangeStart}–${rangeEnd} of ${filteredProducts.length} products`;

    return (
        <section className="space-y-4">
            <PageHeader
                title="Products"
                subtitle="Enterprise product catalog with lifecycle status, size mapping, and ERP-ready CRUD flows."
                actions={
                    <Button type="button" variant="primary" size="sm" leftIcon={PlusIcon} onClick={openCreateModal}>
                        Create Product
                    </Button>
                }
            />

            <ProductControls
                search={searchQuery}
                onSearchChange={setSearchQuery}
                status={statusFilter}
                onStatusChange={setStatusFilter}
                category={categoryFilter}
                onCategoryChange={setCategoryFilter}
                statuses={PRODUCT_STATUS_OPTIONS}
                categories={PRODUCT_CATEGORIES}
                onReset={resetFilters}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={setRowsPerPage}
            />

            {isLoading ? (
                <ProductTableSkeleton />
            ) : products.length === 0 ? (
                <EmptyState
                    icon={CubeIcon}
                    title="No products in the catalog"
                    description="Add the first ERP product record to begin managing manufacturing stock and planning data."
                    action={
                        <Button type="button" variant="secondary" size="sm" onClick={openCreateModal} leftIcon={PlusIcon}>
                            Create Product
                        </Button>
                    }
                />
            ) : filteredProducts.length === 0 ? (
                <EmptyState
                    icon={searchQuery ? MagnifyingGlassIcon : FunnelIcon}
                    title={searchQuery || statusFilter !== 'All' || categoryFilter !== 'All' ? 'No filtered matches' : 'No products'}
                    description={searchQuery || statusFilter !== 'All' || categoryFilter !== 'All'
                        ? 'Adjust the search or filters to reveal products in the catalog.'
                        : 'Add the first ERP product record to begin managing manufacturing stock and planning data.'}
                    action={
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="secondary" size="sm" onClick={resetFilters}>
                                Reset Filters
                            </Button>
                            <Button type="button" variant="secondary" size="sm" onClick={openCreateModal} leftIcon={PlusIcon}>
                                Create Product
                            </Button>
                        </div>
                    }
                />
            ) : (
                <div className="space-y-3">
                    <ProductBulkActionsToolbar
                        selectedCount={selectedIds.length}
                        onArchive={handleBulkArchive}
                        onDelete={handleBulkDelete}
                        onClear={clearSelection}
                    />

                    <ProductTable
                        products={paginatedProducts}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onToggleSelectAll={handleToggleSelectAll}
                        onView={openDetailsModal}
                        onEdit={openEditModal}
                        onDuplicate={handleDuplicateProduct}
                        onArchive={handleArchiveProduct}
                        onDelete={openDeleteModal}
                        page={safePage}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        rangeLabel={rangeLabel}
                    />
                </div>
            )}

            <ProductFormModal
                open={formModal.open}
                onClose={() => setFormModal({ open: false, mode: 'create', product: null })}
                onSubmit={handleSaveProduct}
                mode={formModal.mode}
                product={formModal.product}
                isSaving={isSaving}
            />

            <ProductDetailsModal
                open={detailsModal.open}
                onClose={() => setDetailsModal({ open: false, product: null })}
                product={detailsModal.product}
                onEdit={() => detailsModal.product && openEditModal(detailsModal.product)}
                onDelete={() => detailsModal.product && openDeleteModal(detailsModal.product)}
            />

            <ConfirmationModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, product: null })}
                onConfirm={handleDeleteProduct}
                title="Delete Product"
                description={`Delete ${deleteModal.product?.name || 'this product'} from the catalog? This action cannot be undone.`}
                intent="danger"
                confirmText="Delete Product"
                isLoading={isDeleting}
            />

            <ConfirmationModal
                isOpen={bulkDeleteModal}
                onClose={() => setBulkDeleteModal(false)}
                onConfirm={confirmBulkDelete}
                title="Bulk Delete Products"
                description={`Delete ${selectedIds.length} selected products from the catalog? This action cannot be undone.`}
                intent="danger"
                confirmText="Delete Selected"
                isLoading={isBulkSaving}
            />
        </section>
    );
}
