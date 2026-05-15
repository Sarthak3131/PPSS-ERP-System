import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import useAuthStore from './store/authStore';
import { initializeTheme } from './utils/theme';
import { ToastProvider } from './components/ui/ToastProvider';
import Loader from './components/Loader';
import '../css/app.css';

function ensureMountNode() {
    const existingNode = document.getElementById('ppss-root');

    if (existingNode) {
        return existingNode;
    }

    const node = document.createElement('div');
    node.id = 'ppss-root';
    document.body.appendChild(node);

    return node;
}

function BootstrapSession({ children }) {
    const hydrate = useAuthStore((s) => s.hydrate);
    const sessionChecked = useAuthStore((s) => s.sessionChecked);

    React.useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            void hydrate();
            return undefined;
        }
        const unsub = useAuthStore.persist.onFinishHydration(() => {
            void hydrate();
        });
        return () => unsub();
    }, [hydrate]);

    if (!sessionChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader label="Initializing session..." />
            </div>
        );
    }

    return children;
}

initializeTheme();

const root = createRoot(ensureMountNode());
root.render(
    <React.StrictMode>
        <ToastProvider>
            <BootstrapSession>
                <RouterProvider router={router} />
            </BootstrapSession>
        </ToastProvider>
    </React.StrictMode>
);
