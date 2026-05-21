import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, EyeIcon, PencilSquareIcon, TrashIcon, ArchiveBoxIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../StatusBadge';
import cn from '../../utils/cn';
import SizeAvatar from './SizeAvatar';
import { formatSizeDimensions } from './sizeFormatting';

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function PaginationButton({ children, disabled, onClick, active = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
                active
                    ? 'border-(--erp-primary) bg-(--erp-primary)/10 text-(--erp-primary)'
                    : 'border-(--erp-border) bg-(--erp-surface) text-(--erp-ink) hover:border-(--erp-muted) hover:bg-(--erp-surface-muted)',
            )}
        >
            {children}
        </button>
    );
}

const SizeTable = React.memo(function SizeTable({ sizes, selectedIds, onToggleSelect, onToggleSelectAll, onView, onEdit, onDuplicate, onArchive, onDelete, page, totalPages, onPageChange, rangeLabel, sortState, onSort }) {
    const currentIds = sizes.map((size) => size.id);
    const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id));
    const someSelected = currentIds.some((id) => selectedIds.includes(id));
    const sortIndicator = (key) => (sortState?.key === key ? (sortState.direction === 'asc' ? '↑' : '↓') : '↕');

    return (
        <div className="erp-panel overflow-hidden p-0">
            <div className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="table-fixed divide-y divide-(--erp-border) text-sm" style={{ minWidth: '1160px' }}>
                    <colgroup>
                        <col style={{ width: '56px' }} />
                        <col style={{ width: '290px' }} />
                        <col style={{ width: '140px' }} />
                        <col style={{ width: '190px' }} />
                        <col style={{ width: '86px' }} />
                        <col style={{ width: '112px' }} />
                        <col style={{ width: '108px' }} />
                        <col style={{ width: '118px' }} />
                        <col style={{ width: '144px' }} />
                        <col style={{ width: '106px' }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-(--erp-surface-muted)/95 backdrop-blur">
                        <tr>
                            <th className="w-10 px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(node) => {
                                        if (node) node.indeterminate = !allSelected && someSelected;
                                    }}
                                    onChange={(event) => onToggleSelectAll(event.target.checked)}
                                    className="h-4 w-4 align-middle rounded border-(--erp-border) text-(--erp-primary) focus:ring-(--erp-primary)"
                                    aria-label="Select all sizes on this page"
                                />
                            </th>
                            <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap"><button type="button" className="flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" onClick={() => onSort('sizeCode')}>SIZE <span>{sortIndicator('sizeCode')}</span></button></th>
                            <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap"><button type="button" className="flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" onClick={() => onSort('category')}>Category <span>{sortIndicator('category')}</span></button></th>
                            <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap"><button type="button" className="flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" onClick={() => onSort('dimensions')}>Dimensions <span>{sortIndicator('dimensions')}</span></button></th>
                            <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap"><button type="button" className="flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" onClick={() => onSort('unit')}>Unit <span>{sortIndicator('unit')}</span></button></th>
                            <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap"><button type="button" className="flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" onClick={() => onSort('tolerance')}>Tolerance <span>{sortIndicator('tolerance')}</span></button></th>
                            <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap"><button type="button" className="flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" onClick={() => onSort('status')}>Status <span>{sortIndicator('status')}</span></button></th>
                            <th className="px-4 py-3 align-middle text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap"><button type="button" className="flex w-full items-center justify-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" onClick={() => onSort('usageCount')}>Products Using <span>{sortIndicator('usageCount')}</span></button></th>
                            <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap"><button type="button" className="flex items-center gap-1 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" onClick={() => onSort('updatedAt')}>Updated Date <span>{sortIndicator('updatedAt')}</span></button></th>
                            <th className="px-4 py-3 align-middle text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted) whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-(--erp-border)">
                        {sizes.map((size) => {
                            const selected = selectedIds.includes(size.id);
                            const dimensions = formatSizeDimensions(size);

                            return (
                                <tr
                                    key={size.id}
                                    onClick={() => onView(size)}
                                    className={cn(
                                        'group cursor-pointer bg-(--erp-surface) transition-all duration-200 hover:bg-(--erp-surface-muted)',
                                        selected ? 'bg-(--erp-primary)/5 ring-1 ring-(--erp-primary)/20' : '',
                                    )}
                                    style={{ height: '74px' }}
                                >
                                    <td className="align-middle px-4 py-2 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={(event) => onToggleSelect(size.id, event.target.checked)}
                                            onClick={(event) => event.stopPropagation()}
                                            className="h-4 w-4 rounded border-(--erp-border) text-(--erp-primary) focus:ring-(--erp-primary)"
                                            aria-label={`Select ${size.displayName}`}
                                        />
                                    </td>
                                    <td className="align-middle px-4 py-2">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="h-9 w-9 flex-none overflow-hidden rounded-xl self-center"><SizeAvatar label={size.displayName} /></div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-(--erp-ink)" title={size.sizeCode}>{size.sizeCode}</p>
                                                <p className="truncate text-xs text-(--erp-muted)" title={size.displayName}>{size.displayName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="align-middle px-4 py-2 whitespace-nowrap text-(--erp-ink)" title={size.category}>{size.category}</td>
                                    <td className="align-middle px-4 py-2 whitespace-nowrap text-(--erp-ink)" title={dimensions}>
                                        <span className="inline-block max-w-full whitespace-nowrap overflow-hidden text-ellipsis" style={{ minWidth: '180px' }}>{dimensions}</span>
                                    </td>
                                    <td className="align-middle px-5 py-2 whitespace-nowrap text-(--erp-ink)" title={size.unit}>{size.unit}</td>
                                    <td className="align-middle px-3 py-2 whitespace-nowrap text-(--erp-ink)" title={size.tolerance}>{size.tolerance}</td>
                                    <td className="align-middle px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center justify-start">
                                            <StatusBadge status={size.status} />
                                        </div>
                                    </td>
                                    <td className="align-middle px-4 py-2 whitespace-nowrap text-center text-(--erp-ink)" title={`${Number(size.usageCount) || 0} products`}>{Number(size.usageCount) || 0}</td>
                                    <td className="align-middle px-4 py-2 whitespace-nowrap text-(--erp-muted)">{formatDate(size.updatedAt)}</td>
                                    <td className="align-middle px-4 py-2 whitespace-nowrap text-center">
                                        <Menu as="div" className="relative inline-flex h-10 w-10 items-center justify-center text-left" onClick={(event) => event.stopPropagation()}>
                                            <Menu.Button className="inline-flex items-center justify-center rounded-lg border border-(--erp-border) bg-(--erp-surface) p-2 text-(--erp-muted) transition hover:border-(--erp-muted) hover:bg-(--erp-surface-muted) hover:text-(--erp-ink) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" aria-label={`Actions for ${size.displayName}`}>
                                                <EllipsisVerticalIcon className="h-4 w-4" />
                                            </Menu.Button>
                                            <Transition as={Fragment} enter="transition ease-out duration-120" enterFrom="transform opacity-0 scale-95 translate-y-1" enterTo="transform opacity-100 scale-100 translate-y-0" leave="transition ease-in duration-90" leaveFrom="transform opacity-100 scale-100 translate-y-0" leaveTo="transform opacity-0 scale-95 translate-y-1">
                                                <Menu.Items className="absolute right-0 z-70 mt-2 w-56 max-w-[calc(100vw-1rem)] origin-top-right rounded-2xl border border-(--erp-border) bg-(--erp-surface) p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)] focus:outline-none dark:shadow-[0_20px_60px_rgba(2,6,23,0.5)] max-h-[calc(100vh-8rem)] overflow-y-auto sm:w-60">
                                                    <Menu.Item>{({ active }) => <button type="button" onClick={() => onView(size)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-surface-muted) text-(--erp-ink)' : 'text-(--erp-ink)')}><EyeIcon className="h-4 w-4 flex-none" /><span>View Details</span></button>}</Menu.Item>
                                                    <Menu.Item>{({ active }) => <button type="button" onClick={() => onEdit(size)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-surface-muted) text-(--erp-ink)' : 'text-(--erp-ink)')}><PencilSquareIcon className="h-4 w-4 flex-none" /><span>Edit Size</span></button>}</Menu.Item>
                                                    <div className="my-1 border-t border-(--erp-border)" />
                                                    <Menu.Item>{({ active }) => <button type="button" onClick={() => onDuplicate(size)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-surface-muted) text-(--erp-ink)' : 'text-(--erp-ink)')}><DocumentDuplicateIcon className="h-4 w-4 flex-none" /><span>Duplicate Size</span></button>}</Menu.Item>
                                                    <Menu.Item>{({ active }) => <button type="button" onClick={() => onArchive(size)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-surface-muted) text-(--erp-ink)' : 'text-(--erp-ink)')}><ArchiveBoxIcon className="h-4 w-4 flex-none" /><span>Archive Size</span></button>}</Menu.Item>
                                                    <div className="my-1 border-t border-(--erp-border)" />
                                                    <Menu.Item>{({ active }) => <button type="button" onClick={() => onDelete(size)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-(--erp-danger) transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-danger)/10' : '')}><TrashIcon className="h-4 w-4 flex-none" /><span>Delete Size</span></button>}</Menu.Item>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--erp-border) px-4 py-4"><div className="text-sm text-(--erp-muted)">{rangeLabel}</div><div className="flex items-center gap-2"><PaginationButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeftIcon className="h-4 w-4" /></PaginationButton>{Array.from({ length: totalPages }).map((_, index) => { const pageNumber = index + 1; return <PaginationButton key={pageNumber} active={pageNumber === page} onClick={() => onPageChange(pageNumber)}>{pageNumber}</PaginationButton>; })}<PaginationButton disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRightIcon className="h-4 w-4" /></PaginationButton></div></div>
        </div>
    );
});

export default SizeTable;
