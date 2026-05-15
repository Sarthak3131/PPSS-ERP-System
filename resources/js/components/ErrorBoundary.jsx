import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';

/**
 * ErrorBoundary: Production-ready React error handling.
 * Catches errors in child components and displays fallback UI.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-(--erp-bg) px-4 py-10 transition-colors sm:px-6 lg:px-8">
                    <div className="max-w-md rounded-3xl border border-(--erp-border) bg-(--erp-surface) p-8 text-center shadow-2xl">
                        <XCircleIcon className="mx-auto h-12 w-12 text-(--erp-danger)" />
                        <h2 className="mt-4 text-xl font-semibold text-(--erp-ink)">Something went wrong</h2>
                        <p className="mt-2 text-sm text-(--erp-muted)">
                            The application encountered an error. Please try refreshing the page.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-(--erp-muted) hover:text-(--erp-ink)">
                                    Error details (development only)
                                </summary>
                                <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-(--erp-border) bg-(--erp-surface-muted) p-3 text-xs text-(--erp-ink)">
                                    {this.state.error?.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="mt-6 flex justify-center">
                            <Button type="button" variant="danger" onClick={() => window.location.reload()}>
                                Reload Page
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
