import useAuthStore from '../store/authStore';

export default function useAuth() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const sessionChecked = useAuthStore((state) => state.sessionChecked);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const registerAccount = useAuthStore((state) => state.register);
    const hydrate = useAuthStore((state) => state.hydrate);

    return {
        user,
        isAuthenticated,
        sessionChecked,
        isLoading,
        error,
        login,
        logout,
        registerAccount,
        hydrate,
    };
}
