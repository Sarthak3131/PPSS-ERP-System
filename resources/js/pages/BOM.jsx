import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, CubeIcon } from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import * as bomService from '../services/bomService';
import { useToast } from '../components/ui/ToastProvider';

export default function BOM() {
    const [expanded, setExpanded] = useState({});
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const { push: pushToast } = useToast();

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const payload = await bomService.tree();
                const list = Array.isArray(payload?.data) ? payload.data : [];
                if (!cancelled) setGroups(list);
            } catch (e) {
                if (!cancelled) {
                    pushToast({ title: 'Error', message: 'Failed to load bill of materials.', tone: 'error' });
                    setGroups([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [pushToast]);

    const toggleExpand = (productId) => {
        setExpanded((prev) => ({ ...prev, [productId]: !prev[productId] }));
    };

    return (
        <section className="space-y-4 pb-12">
            <PageHeader
                title="Bill of Materials"
                subtitle="Expandable product-component tree structure for precise routing."
            />

            {loading ? (
                <LoadingSkeleton lines={8} />
            ) : (
                <div className="erp-panel overflow-hidden p-0">
                    <div className="flex bg-[var(--erp-surface-muted)] px-4 py-3 border-b border-[var(--erp-border)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--erp-muted)]">
                        <div className="flex-1">Product / Component</div>
                        <div className="w-32 text-right">Quantity</div>
                        <div className="w-24 text-center">Unit</div>
                        <div className="w-24 text-center">Version</div>
                    </div>

                    <div className="divide-y divide-[var(--erp-border)]">
                        {groups.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-[var(--erp-muted)]">No BOM lines found.</div>
                        ) : (
                            groups.map((group) => (
                                <div key={group.product_id}>
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(group.product_id)}
                                        className="flex w-full cursor-pointer items-center bg-[var(--erp-surface)] px-4 py-3 transition hover:bg-[var(--erp-surface-muted)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--erp-primary)]"
                                    >
                                        <div className="flex flex-1 items-center gap-3">
                                            {expanded[group.product_id] ? (
                                                <ChevronDownIcon className="h-5 w-5 text-[var(--erp-muted)]" />
                                            ) : (
                                                <ChevronRightIcon className="h-5 w-5 text-[var(--erp-muted)]" />
                                            )}
                                            <CubeIcon className="h-5 w-5 text-[var(--erp-primary)]" />
                                            <span className="font-semibold text-[var(--erp-ink)]">{group.product_name}</span>
                                        </div>
                                        <div className="w-32 text-right text-sm text-[var(--erp-muted)]">—</div>
                                        <div className="w-24 text-center text-sm text-[var(--erp-muted)]">—</div>
                                        <div className="w-24 text-center text-sm font-medium text-[var(--erp-ink)]">{group.version || '—'}</div>
                                    </button>

                                    {expanded[group.product_id] && (
                                        <div className="bg-[var(--erp-bg)]/50 border-t border-[var(--erp-border)]">
                                            {(group.lines || []).map((comp) => (
                                                <div
                                                    key={comp.id}
                                                    className="flex items-center px-4 py-2 border-b border-[var(--erp-border)]/50 last:border-0 pl-16"
                                                >
                                                    <div className="flex-1 text-sm text-[var(--erp-ink)]">{comp.component_name}</div>
                                                    <div className="w-32 text-right text-sm font-medium tabular-nums text-[var(--erp-ink)]">{comp.quantity_required}</div>
                                                    <div className="w-24 text-center text-sm text-[var(--erp-muted)]">{comp.unit}</div>
                                                    <div className="w-24 text-center text-sm text-[var(--erp-muted)]">—</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
