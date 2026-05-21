import React from 'react';

function SkeletonBar({ className = '' }) { return <div className={`animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${className}`} />; }

export default function SizeTableSkeleton() {
    return <div className="erp-panel overflow-hidden p-0"><div className="border-b border-[var(--erp-border)] px-4 py-3"><div className="flex items-center justify-between gap-4"><SkeletonBar className="h-4 w-44" /><SkeletonBar className="h-8 w-28 rounded-lg" /></div></div><div className="divide-y divide-[var(--erp-border)]">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-12 md:items-center"><div className="md:col-span-2"><SkeletonBar className="h-4 w-24" /></div><div className="md:col-span-2"><SkeletonBar className="h-4 w-40" /></div><div className="md:col-span-2"><SkeletonBar className="h-4 w-28" /></div><div className="md:col-span-2"><SkeletonBar className="h-4 w-20" /></div><div className="md:col-span-1"><SkeletonBar className="h-6 w-16 rounded-md" /></div><div className="md:col-span-1"><SkeletonBar className="h-4 w-20" /></div><div className="md:col-span-1 md:flex md:justify-end"><SkeletonBar className="h-8 w-24 rounded-lg" /></div></div>)}</div></div>;
}
