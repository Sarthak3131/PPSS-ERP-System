import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, EllipsisVerticalIcon, CubeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import cn from '../../utils/cn';
import StatusBadge from '../StatusBadge';

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function countDescendants(children = []) {
    return children.reduce((count, child) => count + 1 + countDescendants(child.children || []), 0);
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

function BomNodeCell({ node, level, hasChildren, isExpanded, onToggleExpand }) {
    const indent = level * 18;

    return (
        <div className="flex min-w-0 items-start gap-3" style={{ paddingLeft: `${indent}px` }}>
            {hasChildren ? (
                <button
                    type="button"
                    onClick={onToggleExpand}
                    className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-(--erp-border) bg-(--erp-surface) text-(--erp-muted) transition hover:border-(--erp-muted) hover:bg-(--erp-surface-muted) hover:text-(--erp-ink) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)"
                    aria-label={isExpanded ? `Collapse ${node.componentName}` : `Expand ${node.componentName}`}
                >
                    {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                </button>
            ) : (
                <div className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center text-(--erp-muted)">
                    <span className="h-px w-4 bg-(--erp-border)" />
                </div>
            )}

            <div className={cn('flex min-w-0 flex-1 items-center gap-3', level > 0 ? 'border-l border-(--erp-border)/60 pl-3' : '')}>
                <div className="h-9 w-9 flex-none overflow-hidden rounded-xl bg-(--erp-surface-muted) text-(--erp-primary)">
                    <div className="flex h-full w-full items-center justify-center">
                        <CubeIcon className="h-4 w-4" />
                    </div>
                </div>

                <div className="min-w-0">
                    <p className="truncate font-medium text-(--erp-ink)" title={node.componentName}>
                        {node.componentName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-(--erp-muted)" title={node.supplier || node.componentCode || node.parentProduct?.name || ''}>
                        {node.componentCode || '—'}
                        {node.supplier ? ` • ${node.supplier}` : ''}
                    </p>
                    {level === 0 ? (
                        <div className="mt-1 flex flex-wrap gap-2">
                            <span className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 bg-(--erp-primary)/10 text-(--erp-primary) ring-(--erp-primary)/20">
                                {countDescendants(node.children || [])} components
                            </span>
                            {node.notes ? (
                                <span className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 bg-(--erp-surface-muted) text-(--erp-muted) ring-(--erp-border)" title={node.notes}>
                                    Supplier note
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function RowActions({ node, onEdit, onDelete }) {
    return (
        <Menu as="div" className="relative inline-flex h-10 w-10 items-center justify-center text-left" onClick={(event) => event.stopPropagation()}>
            <Menu.Button className="inline-flex items-center justify-center rounded-lg border border-(--erp-border) bg-(--erp-surface) p-2 text-(--erp-muted) transition hover:border-(--erp-muted) hover:bg-(--erp-surface-muted) hover:text-(--erp-ink) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)" aria-label={`Actions for ${node.componentName}`}>
                <EllipsisVerticalIcon className="h-4 w-4" />
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-120"
                enterFrom="transform opacity-0 scale-95 translate-y-1"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-90"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-1"
            >
                <Menu.Items className="absolute right-0 z-70 mt-2 w-56 max-w-[calc(100vw-1rem)] origin-top-right rounded-2xl border border-(--erp-border) bg-(--erp-surface) p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)] focus:outline-none dark:shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
                    <Menu.Item>
                        {({ active }) => (
                            <button type="button" onClick={() => onEdit(node)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-surface-muted) text-(--erp-ink)' : 'text-(--erp-ink)')}>
                                <PencilSquareIcon className="h-4 w-4 flex-none" />
                                <span>Edit BOM Line</span>
                            </button>
                        )}
                    </Menu.Item>
                    <div className="my-1 border-t border-(--erp-border)" />
                    <Menu.Item>
                        {({ active }) => (
                            <button type="button" onClick={() => onDelete(node)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-(--erp-danger) transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-danger)/10' : '')}>
                                <TrashIcon className="h-4 w-4 flex-none" />
                                <span>Delete BOM Line</span>
                            </button>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}

function renderRows(nodes, expandedIds, onToggleExpand, onEdit, onDelete, level = 0) {
    return nodes.map((node) => {
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const isExpanded = Boolean(expandedIds[node.id]);

        return (
            <React.Fragment key={node.id}>
                <tr
                    className={cn('group h-22 bg-(--erp-surface) transition-all duration-200 hover:bg-(--erp-surface-muted)', hasChildren ? 'cursor-pointer' : 'cursor-default')}
                    onClick={() => {
                        if (hasChildren) onToggleExpand(node.id);
                    }}
                    aria-expanded={hasChildren ? (isExpanded ? 'true' : 'false') : undefined}
                    style={{ height: '88px' }}
                >
                    <td className="align-middle px-4 py-2">
                        <BomNodeCell
                            node={node}
                            level={level}
                            hasChildren={hasChildren}
                            isExpanded={isExpanded}
                            onToggleExpand={() => onToggleExpand(node.id)}
                        />
                    </td>

                    <td className="align-middle px-4 py-2 text-right text-sm font-medium tabular-nums text-(--erp-ink) whitespace-nowrap">
                        {node.quantity}
                    </td>

                    <td className="align-middle px-4 py-2 text-center text-sm text-(--erp-muted) whitespace-nowrap">
                        {node.unit || '—'}
                    </td>

                    <td className="align-middle px-4 py-2 text-center text-sm font-medium text-(--erp-ink) whitespace-nowrap">
                        <span className="inline-flex rounded-md border border-(--erp-border) bg-(--erp-surface-muted) px-2 py-0.5 text-[11px] font-semibold tracking-wide text-(--erp-ink)">
                            {level}
                        </span>
                    </td>

                    <td className="align-middle px-4 py-2 text-center text-sm text-(--erp-ink) whitespace-nowrap">
                        <span className="inline-flex rounded-md border border-(--erp-border) bg-(--erp-surface) px-2 py-0.5 text-[11px] font-semibold tracking-wide text-(--erp-ink)">
                            Rev {node.revision}
                        </span>
                    </td>

                    <td className="align-middle px-4 py-2 whitespace-nowrap">
                        <StatusBadge status={node.status} />
                    </td>

                    <td className="align-middle px-4 py-2 text-(--erp-muted) whitespace-nowrap">
                        <span title={node.lastUpdated}>{formatDate(node.lastUpdated)}</span>
                    </td>

                    <td className="align-middle px-4 py-2 text-center whitespace-nowrap">
                        <RowActions node={node} onEdit={onEdit} onDelete={onDelete} />
                    </td>
                </tr>

                {hasChildren && isExpanded ? renderRows(node.children, expandedIds, onToggleExpand, onEdit, onDelete, level + 1) : null}
            </React.Fragment>
        );
    });
}

const BOMTable = React.memo(function BOMTable({ boms, expandedIds, onToggleExpand, onEdit, onDelete, page, totalPages, onPageChange, rangeLabel }) {
    return (
        <div className="erp-panel overflow-hidden p-0">
            <div className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="table-fixed divide-y divide-(--erp-border) text-sm" style={{ minWidth: '1180px' }}>
                    <colgroup>
                        <col style={{ width: '40%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '8%' }} />
                    </colgroup>

                    <thead className="sticky top-0 z-10 bg-(--erp-surface-muted)/95 backdrop-blur">
                        <tr>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Product / Component</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Qty</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Unit</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Level</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Revision</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Status</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Updated Date</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-(--erp-border)">
                        {renderRows(boms, expandedIds, onToggleExpand, onEdit, onDelete, 0)}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--erp-border) px-4 py-4">
                <div className="text-sm text-(--erp-muted)">{rangeLabel}</div>

                <div className="flex items-center gap-2">
                    <PaginationButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                        <ChevronLeftIcon className="h-4 w-4" />
                    </PaginationButton>

                    {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <PaginationButton key={pageNumber} active={pageNumber === page} onClick={() => onPageChange(pageNumber)}>
                                {pageNumber}
                            </PaginationButton>
                        );
                    })}

                    <PaginationButton disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                        <ChevronRightIcon className="h-4 w-4" />
                    </PaginationButton>
                </div>
            </div>
        </div>
    );
});

export default BOMTable;
