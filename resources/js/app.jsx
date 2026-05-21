import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import useAuthStore from './store/authStore';
import { initializeTheme } from './utils/theme';
import { ToastProvider } from './components/ui/ToastProvider';
import PageLoader from './components/PageLoader';
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

    return children;
}

initializeTheme();

const root = createRoot(ensureMountNode());
root.render(
    <React.StrictMode>
        <ToastProvider>
            <BootstrapSession>
                <React.Suspense fallback={<PageLoader label="Loading ERP module..." />}>
                    <RouterProvider router={router} />
                </React.Suspense>
            </BootstrapSession>
        </ToastProvider>
    </React.StrictMode>
);
