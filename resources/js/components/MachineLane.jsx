import React from 'react';
import ScheduleBlock from './ScheduleBlock';
import Button from './ui/Button';

export default function MachineLane({ machine, onAssignClick, onUnassignClick, onJobDragStart, onLaneDrop, onLaneDragOver, isDropTarget = false }) {
    const activeJobs = machine.assignedJobs?.length ?? 0;
    const cap = machine.capacity != null && machine.capacity !== '' ? Number(machine.capacity) : null;
    const capacityLabel = cap != null && Number.isFinite(cap) ? String(cap) : '—';

    return (
        <section
            className={`space-y-3 rounded-lg transition-colors ${isDropTarget ? 'ring-2 ring-[var(--erp-primary)]/60 ring-offset-2 ring-offset-transparent' : ''}`}
            onDragOver={(event) => onLaneDragOver?.(event, machine.id)}
            onDrop={(event) => onLaneDrop?.(event, machine.id)}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h5 className="text-sm font-semibold text-slate-950 dark:text-slate-100">{machine.name}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                        Machine code: {machine.machineCode || '—'} • Active jobs: {activeJobs}
                        {cap != null && Number.isFinite(cap) ? ` • Rated capacity: ${capacityLabel}` : null}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button type="button" onClick={() => onAssignClick(machine.id)} variant="primary" size="sm">
                        Assign Selected
                    </Button>
                </div>
            </div>

            <div onDoubleClick={() => onUnassignClick && onUnassignClick(machine.id)}>
                <ScheduleBlock machineName={machine.name} machineId={machine.id} jobs={machine.assignedJobs} onJobDragStart={onJobDragStart} />
            </div>
        </section>
    );
}
