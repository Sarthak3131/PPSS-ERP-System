import React, { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import OrderCard from '../components/OrderCard';
import MachineLane from '../components/MachineLane';
import * as machineScheduleService from '../services/machineScheduleService';
import * as productionOrderService from '../services/productionOrderService';
import EmptyState from '../components/ui/EmptyState';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useToast } from '../components/ui/ToastProvider';
import { getApiErrorMessage } from '../utils/apiEnvelope';

export default function SchedulingBoard() {
    const [unscheduled, setUnscheduled] = useState([]);
    const [machineList, setMachineList] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [draggedJob, setDraggedJob] = useState(null);
    const [dropTargetMachineId, setDropTargetMachineId] = useState(null);
    const { push: pushToast } = useToast();

    React.useEffect(() => {
        const handleAssignmentChange = () => {
            fetchBoardData();
        };

        const handleStorageChange = (event) => {
            if (event.key === 'production-order-assignment-changed') {
                fetchBoardData();
            }
        };

        window.addEventListener('production-order-assignment-changed', handleAssignmentChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('production-order-assignment-changed', handleAssignmentChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const fetchBoardData = async () => {
        setIsLoading(true);
        try {
            const [timelineRes, ordersEnvelope] = await Promise.all([
                machineScheduleService.timeline(),
                productionOrderService.getAll()
            ]);

            const orderRows = Array.isArray(ordersEnvelope) ? ordersEnvelope : [];
            const pendingOrders = orderRows
                .filter((o) => (o.status === 'Pending' || o.status === 'Draft') && !o.assigned_machine_id)
                .map((o) => ({
                id: o.id,
                orderId: o.order_number,
                product: o.product?.name || 'Unknown',
                size: o.size?.size_name || 'N/A',
                quantity: o.quantity,
                dueDate: o.due_date || 'TBD',
                estimatedHours: o.estimated_hours || 2,
            }));
            setUnscheduled(pendingOrders);

            const mappedMachines = (Array.isArray(timelineRes) ? timelineRes : []).map((item, index) => ({
                id: item.machine?.id ?? index,
                name: item.machine?.name ?? 'Machine',
                machineCode: item.machine?.machine_code,
                capacity: item.machine?.capacity ?? null,
                assignedJobs: (Array.isArray(item.assigned_orders) ? item.assigned_orders : []).map((job) => ({
                    scheduleId: job.schedule_id,
                    orderId: job.order_number,
                    machineId: item.machine?.id ?? index,
                    product: job.product_name || job.order_number,
                    status: job.status,
                    scheduledStart: job.scheduled_start,
                    scheduledEnd: job.scheduled_end,
                    timeSlot: `${new Date(job.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(job.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                })),
            }));
            setMachineList(mappedMachines);
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to load scheduling board data.', tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBoardData();
    }, []);

    const selectedOrder = useMemo(() => unscheduled.find((o) => o.orderId === selectedOrderId), [unscheduled, selectedOrderId]);

    function handleSelect(orderId) {
        setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
    }

    async function handleAssign(machineId) {
        if (!selectedOrderId) return;
        const order = unscheduled.find(o => o.orderId === selectedOrderId);
        if (!order) return;

        const now = new Date();
        const start = now.toISOString().slice(0, 16).replace('T', ' ');
        const end = new Date(now.getTime() + (order.estimatedHours * 3600000));
        const endStr = end.toISOString().slice(0, 16).replace('T', ' ');

        try {
            await machineScheduleService.assignOrder({
                machine_id: machineId,
                production_order_id: order.id,
                scheduled_start: start,
                scheduled_end: endStr
            });
            pushToast({ title: 'Success', message: `Assigned ${order.orderId} to machine.`, tone: 'success' });
            setSelectedOrderId(null);
            fetchBoardData();
        } catch (error) {
            const validationMessage = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().find(Boolean) : null;
            pushToast({ title: 'Assignment Failed', message: validationMessage || getApiErrorMessage(error), tone: 'error' });
        }
    }

    async function handleUnassign(machineId) {
        const machine = machineList.find(m => m.id === machineId);
        if (!machine || machine.assignedJobs.length === 0) return;
        
        const lastJob = machine.assignedJobs[machine.assignedJobs.length - 1];
        
        try {
            await machineScheduleService.removeOrder(lastJob.scheduleId);
            pushToast({ title: 'Success', message: `Removed job from machine.`, tone: 'success' });
            fetchBoardData();
        } catch (error) {
            const validationMessage = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().find(Boolean) : null;
            pushToast({ title: 'Error', message: validationMessage || getApiErrorMessage(error), tone: 'error' });
        }
    }

    function handleJobDragStart(event, job) {
        setDraggedJob(job);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/json', JSON.stringify({ scheduleId: job.scheduleId, machineId: job.machineId }));
    }

    function handleLaneDragOver(event, machineId) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (dropTargetMachineId !== machineId) {
            setDropTargetMachineId(machineId);
        }
    }

    async function handleLaneDrop(event, machineId) {
        event.preventDefault();
        setDropTargetMachineId(null);

        let payload = draggedJob;
        const data = event.dataTransfer.getData('application/json');
        if (!payload && data) {
            try {
                payload = JSON.parse(data);
            } catch {
                payload = null;
            }
        }

        if (!payload?.scheduleId || !payload?.machineId) {
            setDraggedJob(null);
            return;
        }

        if (payload.machineId === machineId) {
            setDraggedJob(null);
            return;
        }

        const sourceMachine = machineList.find((machine) => machine.id === payload.machineId);
        const sourceJob = sourceMachine?.assignedJobs?.find((job) => job.scheduleId === payload.scheduleId);
        if (!sourceJob) {
            setDraggedJob(null);
            return;
        }

        try {
            await machineScheduleService.updateSchedule(payload.scheduleId, {
                machine_id: machineId,
                scheduled_start: sourceJob.scheduledStart,
                scheduled_end: sourceJob.scheduledEnd,
            });
            pushToast({ title: 'Success', message: `Moved ${sourceJob.orderId} to machine.`, tone: 'success' });
            fetchBoardData();
        } catch (error) {
            const validationMessage = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().find(Boolean) : null;
            pushToast({ title: 'Move Failed', message: validationMessage || getApiErrorMessage(error), tone: 'error' });
        } finally {
            setDraggedJob(null);
        }
    }

    return (
        <section className="space-y-4">
            <PageHeader title="Scheduling Board" subtitle="Assign unscheduled orders to machine lanes with operational board-style hierarchy." />

            <div className="grid gap-4 lg:grid-cols-3">
                <aside className="col-span-1">
                    <div className="sticky top-20 space-y-4">
                        <div className="erp-panel p-3">
                            <h3 className="text-sm font-semibold text-(--erp-ink)">Unscheduled Orders</h3>
                            <p className="mt-1 text-xs text-(--erp-muted)">Select an order, then choose a machine to assign it.</p>
                        </div>

                        <div className="space-y-3">
                            {isLoading ? <LoadingSkeleton lines={4} /> : unscheduled.length === 0 ? (
                                <EmptyState
                                    icon={Squares2X2Icon}
                                    title="All caught up"
                                    description="There are no unscheduled orders to assign right now."
                                    className="py-10"
                                />
                            ) : (
                                unscheduled.map((order) => (
                                    <OrderCard key={order.orderId} order={order} selected={selectedOrderId === order.orderId} onSelect={handleSelect} />
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                <main className="col-span-2 space-y-6">
                    <div className="grid gap-6">
                        {isLoading ? <LoadingSkeleton lines={8} /> : machineList.length === 0 ? (
                            <EmptyState
                                icon={Squares2X2Icon}
                                title="No Machines Configured"
                                description="There are no active machines available for scheduling."
                                className="py-10"
                            />
                        ) : machineList.map((machine) => (
                            <div key={machine.id} className="erp-panel p-3">
                                <MachineLane
                                    machine={machine}
                                    onAssignClick={handleAssign}
                                    onUnassignClick={handleUnassign}
                                    onJobDragStart={handleJobDragStart}
                                    onLaneDragOver={handleLaneDragOver}
                                    onLaneDrop={handleLaneDrop}
                                    isDropTarget={dropTargetMachineId === machine.id}
                                />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </section>
    );
}
