import React from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

/**
 * Table: Production-ready, configurable table component.
 * Supports columns, data, row actions, and loading state.
 */
const Table = React.memo(function Table({
    columns = [],
    data = [],
    rowActions = null,
    loading = false,
    emptyMessage = 'No data available',
    sortable = false,
    onSort = null,
    selectedRowId = null,
    onRowClick = null,
}) {
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' });

    const handleSort = (columnKey) => {
        if (!sortable) return;

        let direction = 'asc';
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        setSortConfig({ key: columnKey, direction });
        onSort?.({ key: columnKey, direction });
    };

    if (loading) {
        return (
            <div className="erp-panel flex items-center justify-center py-10">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--erp-border)] border-t-[var(--erp-primary)]" />
                    <p className="text-sm text-[var(--erp-muted)]">Loading table data...</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="erp-panel flex items-center justify-center py-10">
                <p className="text-sm text-[var(--erp-muted)]">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="erp-panel overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--erp-border)] text-sm">
                    <thead className="sticky top-0 z-10 bg-[var(--erp-surface-muted)]/95 shadow-sm backdrop-blur">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => handleSort(column.key)}
                                    className={[
                                        'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)] transition-colors',
                                        sortable && column.sortable !== false ? 'cursor-pointer hover:bg-[var(--erp-border)]/50' : '',
                                    ].join(' ')}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.label}</span>
                                        {sortable && column.sortable !== false && (
                                            <ChevronUpDownIcon
                                                className={[
                                                    'h-4 w-4 text-[var(--erp-muted)]/60',
                                                    sortConfig.key === column.key ? 'text-[var(--erp-ink)]' : '',
                                                ].join(' ')}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {rowActions && <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--erp-border)]">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row.id ?? rowIndex}
                                onClick={() => onRowClick?.(row)}
                                className={`group transition-all duration-200 bg-[var(--erp-surface)] hover:bg-[var(--erp-surface-muted)] ${onRowClick ? 'cursor-pointer' : ''} ${selectedRowId && (row.id ?? rowIndex) === selectedRowId ? 'bg-[var(--erp-primary)]/5 ring-1 ring-[var(--erp-primary)]/20' : ''}`}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className={`px-4 py-3 text-[var(--erp-ink)] transition-all duration-200 ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                                        {column.render ? column.render(row[column.key], row) : row[column.key] ?? '-'}
                                    </td>
                                ))}
                                {rowActions && (
                                    <td className="px-4 py-2 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">{rowActions(row)}</div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default Table;
