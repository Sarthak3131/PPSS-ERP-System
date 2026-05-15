import React from 'react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import * as productService from '../services/productService';
import { useToast } from '../components/ui/ToastProvider';

const columns = [
    {
        key: 'name',
        label: 'Product Name',
        render: (value) => (
            <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--erp-primary)]/10 text-xs font-semibold text-[var(--erp-primary)]">
                    {value?.slice(0, 1)}
                </span>
                <span>{value}</span>
            </div>
        ),
    },
    { key: 'version', label: 'Version' },
    {
        key: 'description',
        label: 'Description',
        render: (value) => (
            <span className="line-clamp-2 max-w-md text-sm text-[var(--erp-muted)]">{value || '—'}</span>
        ),
    },
    {
        key: 'sizes',
        label: 'Sizes',
        render: (value) => (Array.isArray(value) ? value.length : 0),
    },
];

export default function Products() {
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { push: pushToast } = useToast();

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const payload = await productService.getAll();
                const list = Array.isArray(payload?.data) ? payload.data : [];
                if (!cancelled) setRows(list);
            } catch (e) {
                if (!cancelled) {
                    pushToast({ title: 'Error', message: 'Failed to load products.', tone: 'error' });
                    setRows([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [pushToast]);

    return (
        <section className="space-y-4">
            <PageHeader
                title="Products"
                subtitle="Master product catalog with production-ready hierarchy and status visibility."
            />
            {loading ? <LoadingSkeleton lines={6} /> : <Table columns={columns} data={rows} loading={false} />}
        </section>
    );
}
