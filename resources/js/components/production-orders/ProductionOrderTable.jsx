import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, ChevronDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import cn from '../../utils/cn';
import StatusBadge from '../StatusBadge';

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function ProgressBar({ value = 0 }) {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    return (
        <div className="w-28">
            <div className="h-2 w-full rounded-full bg-(--erp-surface-muted)">
                <div className="h-2 rounded-full bg-(--erp-primary)" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-xs text-(--erp-muted) text-right">{pct}%</div>
        </div>
    );
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
                    : 'border-(--erp-border) bg-(--erp-surface) text-(--erp-ink) hover:border-(--erp-muted) hover:bg-(--erp-surface-muted)'
            )}
        >
            {children}
        </button>
    );
}

function RowActions({ order, onEdit, onDelete }) {
    return (
        <Menu as="div" className="relative inline-flex h-10 w-10 items-center justify-center text-left" onClick={(e) => e.stopPropagation()}>
            <Menu.Button className="inline-flex items-center justify-center rounded-lg border border-(--erp-border) bg-(--erp-surface) p-2 text-(--erp-muted) transition hover:border-(--erp-muted) hover:bg-(--erp-surface-muted) hover:text-(--erp-ink) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)">
                <EllipsisVerticalIcon className="h-4 w-4" />
            </Menu.Button>

            <Transition
                as={React.Fragment}
                enter="transition ease-out duration-120"
                enterFrom="transform opacity-0 scale-95 translate-y-1"
                enterTo="transform opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-90"
                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                leaveTo="transform opacity-0 scale-95 translate-y-1"
            >
                <Menu.Items className="absolute right-0 z-70 mt-2 w-56 max-w-[calc(100vw-1rem)] origin-top-right rounded-2xl border border-(--erp-border) bg-(--erp-surface) p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)] focus:outline-none">
                    <Menu.Item>{({ active }) => <button type="button" onClick={() => onEdit(order)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-surface-muted) text-(--erp-ink)' : 'text-(--erp-ink)')}><PencilSquareIcon className="h-4 w-4 flex-none" /><span>Edit Order</span></button>}</Menu.Item>
                    <div className="my-1 border-t border-(--erp-border)" />
                    <Menu.Item>{({ active }) => <button type="button" onClick={() => onDelete(order)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-(--erp-danger) transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--erp-primary)', active ? 'bg-(--erp-danger)/10' : '')}><TrashIcon className="h-4 w-4 flex-none" /><span>Delete Order</span></button>}</Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}

const ProductionOrderTable = React.memo(function ProductionOrderTable({ orders, expandedIds, onToggleExpand, onEdit, onDelete, page, totalPages, onPageChange, rangeLabel }) {
    return (
        <div className="erp-panel overflow-hidden p-0">
            <div className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="table-fixed divide-y divide-(--erp-border) text-sm" style={{ minWidth: '1320px' }}>
                    <colgroup>
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '18%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '6%' }} />
                    </colgroup>

                    <thead className="sticky top-0 z-10 bg-(--erp-surface-muted)/95 backdrop-blur">
                        <tr>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">ORDER ID</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">PRODUCT</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">BOM REF</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">QTY</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">PRIO</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">MACHINE</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">SHIFT</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">STAGE</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">STATUS</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">DUE DATE</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">PROGRESS</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-(--erp-muted)">ACTIONS</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-(--erp-border)">
                        {orders.map((order) => {
                            const expanded = Boolean(expandedIds[order.id]);
                            return (
                                <React.Fragment key={order.id}>
                                    <tr className="group cursor-pointer bg-(--erp-surface) transition-all duration-200 hover:bg-(--erp-surface-muted)" onClick={() => onToggleExpand(order.id)} aria-expanded={expanded ? 'true' : 'false'} style={{ height: '74px' }}>
                                        <td className="align-middle px-4 py-2 whitespace-nowrap text-(--erp-ink) font-medium">{order.orderCode}</td>
                                        <td className="align-middle px-4 py-2 min-w-0">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-(--erp-ink)" title={order.product?.name}>{order.product?.name}</p>
                                                <p className="truncate text-xs text-(--erp-muted)" title={order.product?.sku}>{order.product?.sku}</p>
                                            </div>
                                        </td>
                                        <td className="align-middle px-4 py-2 whitespace-nowrap text-(--erp-muted)">{order.bomRef?.componentCode || '—'}</td>
                                        <td className="align-middle px-4 py-2 text-right font-medium tabular-nums whitespace-nowrap">{order.quantity}</td>
                                        <td className="align-middle px-4 py-2 text-center whitespace-nowrap">
                                            <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1', order.priority === 'Urgent' ? 'bg-(--erp-danger)/10 text-(--erp-danger) ring-(--erp-danger)/30' : order.priority === 'High' ? 'bg-(--erp-warning)/10 text-(--erp-warning) ring-(--erp-warning)/30' : order.priority === 'Medium' ? 'bg-(--erp-primary)/10 text-(--erp-primary) ring-(--erp-primary)/30' : 'bg-(--erp-surface-muted) text-(--erp-muted) ring-(--erp-border)')}>
                                                {order.priority}
                                            </span>
                                        </td>
                                        <td className="align-middle px-4 py-2 whitespace-nowrap text-(--erp-ink)">{order.machine}</td>
                                        <td className="align-middle px-4 py-2 text-center whitespace-nowrap text-(--erp-muted)">{order.shift}</td>
                                        <td className="align-middle px-4 py-2 text-center whitespace-nowrap text-(--erp-ink)">{order.stage}</td>
                                        <td className="align-middle px-4 py-2 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                                        <td className="align-middle px-4 py-2 whitespace-nowrap text-(--erp-muted)">{formatDate(order.dueDate)}</td>
                                        <td className="align-middle px-4 py-2 text-center whitespace-nowrap"><ProgressBar value={order.progress} /></td>
                                        <td className="align-middle px-4 py-2 text-center whitespace-nowrap"><RowActions order={order} onEdit={onEdit} onDelete={onDelete} /></td>
                                    </tr>

                                    {expanded ? (
                                        <tr className="bg-(--erp-surface)">
                                            <td className="px-4 py-3" colSpan={12}>
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                    <div>
                                                        <p className="text-xs text-(--erp-muted)">Operator / Team</p>
                                                        <p className="font-medium text-(--erp-ink)">{order.team || '—'}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-(--erp-muted)">Runtime Estimate</p>
                                                        <p className="font-medium text-(--erp-ink)">{order.runtimeEstimateMins} mins</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-(--erp-muted)">Material Readiness</p>
                                                        <p className="font-medium text-(--erp-ink)">{order.materialReadiness}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-(--erp-muted)">QA Notes</p>
                                                        <p className="font-medium text-(--erp-ink)">{order.qaNotes || '—'}</p>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <p className="text-xs text-(--erp-muted)">Production Remarks</p>
                                                        <p className="font-medium text-(--erp-ink)">{order.remarks || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : null}
                                </React.Fragment>
                            );
                        })}
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

export default ProductionOrderTable;
