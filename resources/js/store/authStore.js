import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { getApiErrorMessage, getFirstValidationMessage } from '../utils/apiEnvelope';

function formatRegisterError(error) {
    const msg = getApiErrorMessage(error);
    const fields = getFirstValidationMessage(error.response?.data?.errors);
    return fields || msg;
}

let hydrationPromise = null;

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            /** True once initial `/api/v1/me` attempt has finished (success or failure). */
            sessionChecked: false,
            isLoading: false,
            error: null,

            clearSession: () =>
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null,
                }),

            /**
             * Validates the HTTP-only session cookie against `/api/v1/me`.
             * Clears persisted Zustand auth when session is invalid or unreachable.
             */
            hydrate: async () => {
                if (!hydrationPromise) {
                    hydrationPromise = (async () => {
                        set({ sessionChecked: false });
                        try {
                            const data = await authService.me();
                            const user = data?.user ?? null;
                            if (user) {
                                set({
                                    user,
                                    isAuthenticated: true,
                                    error: null,
                                    sessionChecked: true,
                                });
                            } else {
                                get().clearSession();
                                set({ sessionChecked: true });
                            }
                        } catch {
                            get().clearSession();
                            set({ sessionChecked: true });
                        }
                    })();
                }
                await hydrationPromise;
            },

            login: async (credentials) => {
                set({
                    isLoading: true,
                    error: null,
                });

                try {
                    const data = await authService.login(credentials);
                    const user = data.user;

                    if (!user) {
                        throw new Error('Unable to sign in. Please try again.');
                    }

                    set({
                        user,
                        isAuthenticated: true,
                    });

                    return true;
                } catch (error) {
                    const message = getApiErrorMessage(error);
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: message,
                    });

                    throw error;
                } finally {
                    set({
                        isLoading: false,
                    });
                }
            },

            register: async (formData) => {
                set({ error: null });
                try {
                    await authService.register({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        password_confirmation: formData.password_confirmation,
                    });
                    return true;
                } catch (error) {
                    throw new Error(formatRegisterError(error));
                }
            },

            logout: async () => {
                try {
                    await authService.logout();
                } catch {
                    /* Expired or missing session: still clear client state. */
                } finally {
                    get().clearSession();
                }
            },
        }),
        {
            name: 'ppss-auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
