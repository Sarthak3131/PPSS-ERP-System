import React, { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import * as inventoryService from '../services/inventoryService';
import { useToast } from '../components/ui/ToastProvider';
import FormInput from '../components/ui/FormInput';
import Select from '../components/ui/Select';
import TableToolbar from '../components/ui/TableToolbar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';

const columns = [
    { key: 'itemId', label: 'Item ID' },
    { key: 'itemName', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    { key: 'stockQuantity', label: 'Stock Quantity', align: 'right' },
    { key: 'unit', label: 'Unit' },
    { key: 'reorderLevel', label: 'Reorder Level', align: 'right' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'leadTime', label: 'Lead Time' },
    { key: 'reorderEta', label: 'Reorder ETA' },
    { key: 'stockHealth', label: 'Stock Health' },
    { key: 'projectedDepletion', label: 'Projected Depletion' },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
];

export default function Inventory() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [inventory, setInventory] = useState([]);
    const [alerts, setAlerts] = useState({ low_stock: [], out_of_stock: [], critical_stock: [] });
    const { push: pushToast } = useToast();

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const [items, alertPayload] = await Promise.all([
                inventoryService.getAll(),
                inventoryService.alerts(),
            ]);

            const mappedInventory = (Array.isArray(items) ? items : []).map((item) => ({
                id: item.id,
                itemId: item.item_code,
                itemName: item.item_name,
                category: item.category,
                stockQuantity: item.stock_quantity,
                unit: item.unit,
                reorderLevel: item.reorder_level,
                supplier: item.supplier || 'N/A',
                leadTime: item.lead_time_days ? `${item.lead_time_days} Days` : 'N/A',
                reorderEta: 'N/A',
                stockHealth: item.stock_quantity <= 0 ? 'Out of Stock' : (item.stock_quantity <= item.reorder_level ? 'Low Stock' : 'Healthy'),
                projectedDepletion: 'N/A',
                status: item.status || 'Active',
            }));
            
            setInventory(mappedInventory);
            setAlerts({
                low_stock: Array.isArray(alertPayload?.low_stock) ? alertPayload.low_stock : [],
                critical_stock: Array.isArray(alertPayload?.critical_stock) ? alertPayload.critical_stock : [],
                out_of_stock: Array.isArray(alertPayload?.out_of_stock) ? alertPayload.out_of_stock : [],
            });
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to load inventory data', tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchInventory();
    }, []);

    const categories = useMemo(() => {
        if (!inventory.length) return ['All'];
        return ['All', ...new Set(inventory.map((item) => item.category))];
    }, [inventory]);

    const filteredData = useMemo(() => {
        const query = search.trim().toLowerCase();

        return inventory.filter((item) => {
            const matchesSearch =
                !query ||
                item.itemId.toLowerCase().includes(query) ||
                item.itemName.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query);

            const matchesCategory = category === 'All' || item.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [inventory, search, category]);

    return (
        <section className="space-y-4">
            <PageHeader
                title="Inventory"
                subtitle="Inventory visibility with threshold risk, supplier view, and projected depletion."
            />

            {!isLoading && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border bg-orange-50 border-orange-100 flex flex-col justify-center">
                        <h4 className="text-orange-800 font-medium text-sm">Low Stock</h4>
                        <p className="text-2xl font-bold text-orange-900">{alerts.low_stock.length}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-red-50 border-red-100 flex flex-col justify-center">
                        <h4 className="text-red-800 font-medium text-sm">Critical Stock</h4>
                        <p className="text-2xl font-bold text-red-900">{alerts.critical_stock.length}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 flex flex-col justify-center">
                        <h4 className="text-gray-800 font-medium text-sm">Out of Stock</h4>
                        <p className="text-2xl font-bold text-gray-900">{alerts.out_of_stock.length}</p>
                    </div>
                </div>
            )}

            <TableToolbar
                title="Stock & Materials"
                subtitle="Search items and monitor reorder thresholds."
                className="gap-3"
                right={
                    <>
                        <div className="min-w-72">
                            <FormInput
                                id="inventory-search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search item, ID, category"
                                aria-label="Search inventory"
                            />
                        </div>
                        <Select
                            id="inventory-category"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="min-w-56"
                            aria-label="Filter inventory by category"
                        >
                            {categories.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </Select>
                        <Button type="button" variant="secondary" size="sm" onClick={() => { setSearch(''); setCategory('All'); }}>
                            Reset
                        </Button>
                    </>
                }
            />

            {isLoading ? (
                <LoadingSkeleton lines={8} />
            ) : filteredData.length === 0 ? (
                <EmptyState
                    icon={ArchiveBoxIcon}
                    title="No inventory records found"
                    description="Try a broader search or reset category filters to view all stock items."
                    action={<Button type="button" size="sm" onClick={() => { setSearch(''); setCategory('All'); }}>Reset Filters</Button>}
                />
            ) : (
                <Table columns={columns} data={filteredData} emptyMessage="No inventory items match your search and filter." />
            )}
        </section>
    );
}
