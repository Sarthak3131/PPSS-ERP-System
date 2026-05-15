import React from 'react';
import cn from '../../utils/cn';

export default function LoadingSkeleton({ lines = 3, className }) {
    return (
        <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-900', className)}>
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            'h-3 animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] [animation:shimmer_1.6s_infinite] dark:from-slate-700 dark:via-slate-600 dark:to-slate-700',
                            index === 0 ? 'w-2/3' : index === 1 ? 'w-5/6' : 'w-1/2',
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

