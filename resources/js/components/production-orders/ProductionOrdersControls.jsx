import React from 'react';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function ProductionOrdersControls({ search, onSearchChange, rowsPerPage, onRowsPerPageChange, onReset, onCreate }) {
    return (
        <div className="erp-panel flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="flex min-w-0 flex-1 items-center">
                <div className="w-full sm:w-56">
                    <FormInput
                        id="po-search"
                        type="search"
                        value={search}
                        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        placeholder="Search orders, product, machine"
                        aria-label="Search production orders"
                        inputClassName="h-9"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-end justify-end gap-1.5 sm:gap-2">
                <div className="w-36">
                    <Select id="po-rows-per-page" value={String(rowsPerPage)} onChange={(e) => onRowsPerPageChange && onRowsPerPageChange(Number(e.target.value))} aria-label="Rows per page">
                        {[5, 10, 15, 20].map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </Select>
                </div>

                <Button type="button" variant="secondary" size="sm" className="h-9" onClick={() => onReset && onReset()}>
                    Reset
                </Button>

                <Button type="button" variant="primary" size="sm" className="h-9" onClick={() => onCreate && onCreate()}>
                    Create Order
                </Button>
            </div>
        </div>
    );
}
