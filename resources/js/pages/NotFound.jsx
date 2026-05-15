import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import { ROUTE_NAMES } from '../utils/constants';
import Button from '../components/ui/Button';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
            <div className="max-w-md text-center">
                <p className="text-6xl font-bold tracking-tight text-slate-900 dark:text-white">404</p>
                <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    The route you&apos;re looking for doesn&apos;t exist in the PPSS ERP system.
                </p>

                <div className="mt-6 flex justify-center">
                    <Button as={Link} to={ROUTE_NAMES.DASHBOARD} variant="primary" leftIcon={HomeIcon}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
