import React from 'react';

export default function ScheduleBlock({ machineName, machineId, jobs = [], onJobDragStart }) {
    return (
        <section className="erp-subpanel">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h4 className="font-semibold text-[var(--erp-ink)]">{machineName} Schedule</h4>
                    <p className="text-sm text-[var(--erp-muted)]">Visual timeline of assigned orders.</p>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="relative h-16 min-w-[600px] w-full rounded-lg bg-[var(--erp-surface)] border border-[var(--erp-border)] overflow-hidden flex shadow-inner">
                    {jobs.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--erp-muted)]">Idle - No jobs scheduled</div>
                ) : (
                    jobs.map((job) => {
                        let colorClass = 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
                        if (job.status === 'Pending') colorClass = 'bg-[var(--erp-warning)]/10 text-[var(--erp-warning)] border-[var(--erp-warning)]/20';
                        if (job.status === 'In Progress') colorClass = 'bg-[var(--erp-info)]/10 text-[var(--erp-info)] border-[var(--erp-info)]/20';
                        if (job.status === 'Completed') colorClass = 'bg-[var(--erp-success)]/10 text-[var(--erp-success)] border-[var(--erp-success)]/20';
                        if (job.status === 'Released') colorClass = 'bg-[var(--erp-primary)]/10 text-[var(--erp-primary)] border-[var(--erp-primary)]/20';
                        
                        return (
                            <div 
                                key={job.scheduleId ?? job.orderId} 
                                draggable
                                onDragStart={(event) => onJobDragStart?.(event, { ...job, machineId, machineName })}
                                className={`group relative h-full flex-1 border-r last:border-r-0 ${colorClass} transition-all duration-300 hover:brightness-95 hover:flex-[1.2] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing`}
                            >
                                <span className="text-[11px] font-bold uppercase tracking-wider">{job.orderId}</span>
                                <span className="text-[10px] opacity-80 truncate px-1">{job.timeSlot || ''}</span>
                                
                                <div className="absolute bottom-full mb-2 scale-0 group-hover:scale-100 transition-transform bg-[var(--erp-ink)] text-[var(--erp-surface)] text-xs rounded-md px-2 py-1 z-10 shadow-lg whitespace-nowrap">
                                    {job.orderId} • {job.status}
                                </div>
                            </div>
                        );
                    })
                )}
                </div>
            </div>
        </section>
    );
}