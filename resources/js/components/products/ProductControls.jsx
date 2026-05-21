import React from 'react';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';

export default function ProductControls({
    search,
    onSearchChange,
    status,
    onStatusChange,
    category,
    onCategoryChange,
    statuses,
    categories,
    onReset,
    rowsPerPage,
    onRowsPerPageChange,
}) {
    return (
        <div className="erp-panel space-y-3 px-4 py-3">
            <div>
                <h3 className="text-sm font-semibold text-[var(--erp-ink)]">Product catalog controls</h3>
                <p className="mt-0.5 text-xs text-[var(--erp-muted)]">
                    Search SKUs, refine by lifecycle state, and keep the catalog ready for planning.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div className="sm:col-span-2 lg:col-span-5">
                    <FormInput
                        id="products-search"
                        type="search"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search by product name or SKU"
                        aria-label="Search by product name or SKU"
                    />
                </div>
                <div className="sm:col-span-1 lg:col-span-3">
                    <Select id="products-status-filter" label="Status" value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter by status">
                        <option value="All">All statuses</option>
                        {statuses.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="sm:col-span-1 lg:col-span-3">
                    <Select id="products-category-filter" label="Category" value={category} onChange={(event) => onCategoryChange(event.target.value)} aria-label="Filter by category">
                        <option value="All">All categories</option>
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="sm:col-span-1 lg:col-span-1 lg:flex lg:justify-end">
                    <Button type="button" variant="secondary" size="sm" className="w-full md:w-auto" onClick={onReset}>
                        Reset
                    </Button>
                </div>
                <div className="sm:col-span-1 lg:col-span-2">
                    <Select id="products-page-size" label="Rows / page" value={String(rowsPerPage)} onChange={(event) => onRowsPerPageChange(Number(event.target.value))} aria-label="Rows per page">
                        {[5, 10, 15, 20].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    );
}
