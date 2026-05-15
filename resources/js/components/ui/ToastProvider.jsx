import React from 'react';
import { Toast, ToastViewport } from './Toast';

const ToastContext = React.createContext(null);

function createId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = React.useState([]);

    const push = React.useCallback((toast) => {
        const id = createId();
        const durationMs = toast.durationMs ?? 3500;

        setToasts((current) => [...current, { id, ...toast }]);
        if (durationMs > 0) {
            window.setTimeout(() => {
                setToasts((current) => current.filter((item) => item.id !== id));
            }, durationMs);
        }

        return id;
    }, []);

    const remove = React.useCallback((id) => {
        setToasts((current) => current.filter((item) => item.id !== id));
    }, []);

    const value = React.useMemo(() => ({ push, remove }), [push, remove]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        tone={toast.tone}
                        title={toast.title}
                        message={toast.message}
                        onClose={() => remove(toast.id)}
                    />
                ))}
            </ToastViewport>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}

