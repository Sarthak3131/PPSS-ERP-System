import React from 'react';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';

export default function SizeControls({ search, onSearchChange, category, onCategoryChange, status, onStatusChange, unit, onUnitChange, rowsPerPage, onRowsPerPageChange, categories, statuses, units, onReset }) {
    return (
        <div className="erp-panel space-y-2.5 px-4 py-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--erp-ink)]">Size catalog controls</h3>
                    <p className="mt-0.5 text-xs text-[var(--erp-muted)]">Search, filter, and tune the size matrix for manufacturing planning.</p>
                </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div className="sm:col-span-2 lg:col-span-4"><FormInput id="sizes-search" type="search" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search code, name, supplier, usage notes" aria-label="Search sizes" /></div>
                <div className="sm:col-span-1 lg:col-span-2"><Select id="sizes-category" label="Category" value={category} onChange={(e) => onCategoryChange(e.target.value)}><option value="All">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</Select></div>
                <div className="sm:col-span-1 lg:col-span-2"><Select id="sizes-status" label="Status" value={status} onChange={(e) => onStatusChange(e.target.value)}><option value="All">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</Select></div>
                <div className="sm:col-span-1 lg:col-span-2"><Select id="sizes-unit" label="Unit" value={unit} onChange={(e) => onUnitChange(e.target.value)}><option value="All">All units</option>{units.map((item) => <option key={item} value={item}>{item}</option>)}</Select></div>
                <div className="sm:col-span-1 lg:col-span-1 lg:flex lg:justify-end"><Button type="button" variant="secondary" size="sm" className="w-full lg:w-auto" onClick={onReset}>Reset</Button></div>
                <div className="sm:col-span-1 lg:col-span-1"><Select id="sizes-page-size" label="Rows / page" value={String(rowsPerPage)} onChange={(e) => onRowsPerPageChange(Number(e.target.value))}>{[5, 10, 15, 20].map((size) => <option key={size} value={size}>{size}</option>)}</Select></div>
            </div>
        </div>
    );
}
