import React from 'react';
import { ClockIcon, WrenchScrewdriverIcon, WrenchIcon } from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import MachineCard from '../components/MachineCard';
import ScheduleBlock from '../components/ScheduleBlock';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import { ROUTE_NAMES } from '../utils/constants';

import { useToast } from '../components/ui/ToastProvider';
import * as machineService from '../services/machineService';
import * as machineScheduleService from '../services/machineScheduleService';

function normalizeEfficiency(rating) {
    const n = Number(rating);
    if (!Number.isFinite(n)) return '—';
    if (n <= 1) return `${Math.round(n * 100)}%`;
    return `${Math.round(n)}%`;
}

export default function MachinePlanning() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [machines, setMachines] = React.useState([]);
    const [scheduleLanes, setScheduleLanes] = React.useState([]);
    const { push: pushToast } = useToast();

    React.useEffect(() => {
        const handleAssignmentChange = () => {
            fetchMachines();
        };

        const handleStorageChange = (event) => {
            if (event.key === 'production-order-assignment-changed') {
                fetchMachines();
            }
        };

        window.addEventListener('production-order-assignment-changed', handleAssignmentChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('production-order-assignment-changed', handleAssignmentChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const fetchMachines = async () => {
        setIsLoading(true);
        try {
            const [utilRes, timelineRes] = await Promise.all([machineService.utilization(), machineScheduleService.timeline()]);

            const mappedMachines = (Array.isArray(utilRes) ? utilRes : []).map((item, index) => {
                const machine = item.machine ?? {};
                const raw = machine?.efficiency_rating ?? machine?.efficiency_normalized;
                return {
                    id: machine.id ?? index,
                    name: machine.name ?? 'Machine',
                    capacity: machine.capacity_per_hour ?? machine.capacity ?? item.capacity,
                    status: machine.status,
                    utilization: `${item.utilization_percentage ?? 0}%`,
                    shift: '—',
                    operator: '—',
                    maintenanceDue: machine.status === 'Maintenance' ? 'In progress' : '—',
                    efficiency: normalizeEfficiency(raw),
                    healthScore: normalizeEfficiency(raw),
                };
            });

            const lanes = (Array.isArray(timelineRes) ? timelineRes : []).map((row, idx) => ({
                id: row.machine?.id ?? idx,
                machineName: row.machine?.name ?? 'Machine',
                jobs: (Array.isArray(row.assigned_orders) ? row.assigned_orders : []).map((job) => ({
                    scheduleId: job.schedule_id,
                    orderId: job.order_number,
                    machineId: row.machine?.id ?? idx,
                    timeSlot: `${new Date(job.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(job.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    status: job.status,
                })),
            }));

            setMachines(mappedMachines);
            setScheduleLanes(lanes);
        } catch (error) {
            pushToast({ title: 'Error', message: 'Failed to load machine data.', tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMachines();
    }, []);

    const activeCount = machines.filter((m) => m.status === 'Running' || m.status === 'Active').length;
    const idleCount = machines.filter((m) => m.status === 'Idle' || m.status === 'Offline').length;
    const maintenanceCount = machines.filter((m) => m.status === 'Maintenance').length;

    const statusSummary = [
        { label: 'Machines active', value: activeCount.toString() },
        { label: 'Idle / offline', value: idleCount.toString() },
        { label: 'Under maintenance', value: maintenanceCount.toString() },
    ];
    return (
        <section className="space-y-4">
            <PageHeader
                title="Machine Planning"
                subtitle="Split-screen ERP scheduling view for machine allocation and time-based planning."
            />

            <div className="grid gap-3 sm:grid-cols-3">
                {statusSummary.map((item) => (
                    <div key={item.label} className="erp-panel p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--erp-muted)">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-(--erp-ink)">{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[30%_70%]">
                <aside className="erp-panel p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <WrenchScrewdriverIcon className="h-5 w-5 text-(--erp-muted)" />
                        <div>
                            <h3 className="text-lg font-semibold text-(--erp-ink)">Machine List</h3>
                            <p className="text-sm text-(--erp-muted)">Capacity per hour and status overview.</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <LoadingSkeleton lines={6} />
                    ) : machines.length === 0 ? (
                        <EmptyState title="No machines found" description="There are currently no machines registered in the database." icon={WrenchScrewdriverIcon} />
                    ) : (
                        <div className="space-y-3">
                            {machines.map((machine) => (
                                <MachineCard key={machine.id} {...machine} />
                            ))}
                        </div>
                    )}
                </aside>

                <main className="erp-panel p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-(--erp-muted)" />
                        <div>
                            <h3 className="text-lg font-semibold text-(--erp-ink)">Schedule View</h3>
                            <p className="text-sm text-(--erp-muted)">Assigned jobs by machine from live schedule timeline.</p>
                        </div>
                    </div>

                    <div className="max-h-136 space-y-4 overflow-y-auto pr-1">
                        {isLoading ? (
                            <LoadingSkeleton lines={6} />
                        ) : scheduleLanes.length ? (
                            scheduleLanes.map((machineSchedule) => <ScheduleBlock key={machineSchedule.id} {...machineSchedule} />)
                        ) : (
                            <EmptyState
                                icon={WrenchIcon}
                                title="No machine schedules available"
                                description="No lanes are currently planned. Create or assign jobs on the scheduling board."
                                action={
                                    <Button as={Link} to={ROUTE_NAMES.SCHEDULING_BOARD} size="sm">
                                        Open scheduling board
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </main>
            </div>
        </section>
    );
}
