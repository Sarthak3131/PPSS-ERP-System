import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    if (id.includes('recharts')) {
                        return 'chart';
                    }

                    if (id.includes('@headlessui') || id.includes('@heroicons')) {
                        return 'ui';
                    }

                    if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                        return 'vendor';
                    }

                    return 'vendor';
                },
            },
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
