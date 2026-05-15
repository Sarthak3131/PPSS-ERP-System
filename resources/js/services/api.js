import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
    },
});

function shouldRunUnauthorizedHandler(config) {
    if (!config || config.skipAuthHandler) return false;
    const url = typeof config.url === 'string' ? config.url : '';
    if (url.includes('/v1/login') || url.includes('/v1/register')) return false;
    return true;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const config = error.config;
        if (
            (status === 401 || status === 419) &&
            shouldRunUnauthorizedHandler(config)
        ) {
            try {
                const { default: useAuthStore } = await import('../store/authStore.js');
                useAuthStore.getState().clearSession?.();
            } catch {
                /* avoid breaking callers if dynamic import fails */
            }
        }
        return Promise.reject(error);
    }
);

export default api;
