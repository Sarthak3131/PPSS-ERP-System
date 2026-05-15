import React from 'react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import * as sizeService from '../services/sizeService';
import { useToast } from '../components/ui/ToastProvider';

const columns = [
    { key: 'size_name', label: 'Size Name' },
    { key: 'barcode', label: 'Barcode', render: (v) => v || '—' },
    {
        key: 'product',
        label: 'Product',
        render: (value) => (value && typeof value === 'object' ? value.name : '—'),
    },
];

export default function Sizes() {
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { push: pushToast } = useToast();

    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const payload = await sizeService.getAll();
                const list = Array.isArray(payload?.data) ? payload.data : [];
                if (!cancelled) setRows(list);
            } catch (e) {
                if (!cancelled) {
                    pushToast({ title: 'Error', message: 'Failed to load sizes.', tone: 'error' });
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
                title="Sizes"
                subtitle="Size matrix and measurement standards with compact manufacturing density."
            />
            {loading ? <LoadingSkeleton lines={6} /> : <Table columns={columns} data={rows} loading={false} />}
        </section>
    );
}
