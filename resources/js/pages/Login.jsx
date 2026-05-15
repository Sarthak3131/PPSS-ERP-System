import React from 'react';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { loginSchema } from '../utils/validators/authSchema';
import { ROUTE_NAMES } from '../utils/constants';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';
import { useToast } from '../components/ui/ToastProvider';

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, isAuthenticated, isLoading, error } = useAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    const { push: pushToast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (formData) => {
        try {
            await login({
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe,
            });
            const redirectTo = location.state?.from || ROUTE_NAMES.DASHBOARD;
            navigate(redirectTo, { replace: true });
        } catch (error) {
            return;
        }
    };

    React.useEffect(() => {
        if (isAuthenticated) {
            const redirectTo = location.state?.from || ROUTE_NAMES.DASHBOARD;
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, location.state, navigate]);

    return (
        <div className="mx-auto grid w-full max-w-6xl min-h-175 overflow-hidden rounded-3xl border border-(--erp-border) bg-(--erp-surface) shadow-xl md:grid-cols-2 items-stretch">
            {/* Left Hero */}
            <div className="relative flex w-full h-full flex-col justify-center bg-linear-to-br from-(--erp-surface-muted) to-(--erp-bg) p-12 lg:p-16">
                <div className="absolute inset-0 bg-(--erp-primary)/5 backdrop-blur-3xl" />
                <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col justify-center space-y-6">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-(--erp-primary)">PPSS ERP</p>
                        <h1 className="mt-2 text-5xl font-bold leading-tight text-(--erp-ink)">Production Planning & Scheduling System</h1>
                        <p className="mt-4 max-w-md text-lg leading-8 text-(--erp-muted)">Centralized production scheduling, machine allocation, and workflow orchestration.</p>
                    </div>
                    
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-(--erp-muted)">
                            <CheckCircleIcon className="h-6 w-6 text-(--erp-primary)" />
                            <span className="text-base font-medium">Smart production scheduling</span>
                        </li>
                        <li className="flex items-center gap-3 text-(--erp-muted)">
                            <CheckCircleIcon className="h-6 w-6 text-(--erp-primary)" />
                            <span className="text-base font-medium">Real-time machine allocation</span>
                        </li>
                        <li className="flex items-center gap-3 text-(--erp-muted)">
                            <CheckCircleIcon className="h-6 w-6 text-(--erp-primary)" />
                            <span className="text-base font-medium">Workflow visibility across teams</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Form */}
            <div className="flex w-full items-center justify-center px-8 py-12">
                <div className="w-full max-w-md rounded-2xl border border-(--erp-border) bg-(--erp-surface) p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-(--erp-ink)">Access Planning Console</h2>
                    <p className="mt-2 text-base text-(--erp-muted)">Sign in to manage production workflows.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                        <FormInput
                            id="email"
                            type="email"
                            autoFocus
                            autoComplete="email"
                            label="Email"
                            placeholder="planner@ppss.local"
                            error={errors.email?.message}
                            className="w-full"
                            {...register('email')}
                        />

                        <FormInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            label="Password"
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            className="w-full"
                            rightAdornment={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="rounded-lg p-2 text-(--erp-muted) transition hover:bg-(--erp-surface-muted) hover:text-(--erp-ink)"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            }
                            {...register('password')}
                        />

                        <div className="flex items-center">
                            <label className="flex items-center gap-2 text-sm font-medium text-(--erp-muted)">
                                <input
                                    type="checkbox"
                                    {...register('rememberMe')}
                                    className="h-4 w-4 rounded border-(--erp-border) bg-(--erp-surface) text-(--erp-primary) transition focus:ring-2 focus:ring-(--erp-primary)"
                                />
                                Remember me
                            </label>
                        </div>

                        {error ? (
                            <div className="rounded-xl border border-(--erp-danger)/40 bg-(--erp-danger)/10 px-4 py-3 text-sm text-(--erp-danger)">
                                {error}
                            </div>
                        ) : null}

                        <Button type="submit" variant="primary" size="lg" className="w-full hover:scale-[1.01] active:scale-[0.99] transition-all" loading={isLoading}>
                            {isLoading ? 'Signing in...' : 'Login'}
                        </Button>
                        
                        <p className="text-center text-xs text-(--erp-muted)">
                            Protected by enterprise-grade access control.
                        </p>
                        
                        <div className="mt-4 flex flex-col items-center justify-center text-sm">
                            <button type="button" onClick={() => pushToast({ title: 'Access', message: 'Contact your administrator to request supervisor access.', tone: 'info' })} className="font-medium text-(--erp-muted) transition hover:text-(--erp-ink) hover:underline">
                                Need supervisor access? Contact administrator
                            </button>
                        </div>
                            
                        <p className="mt-6 text-center text-sm text-[var(--erp-muted)]">
                            New user?{' '}
                            <Link
                                to={ROUTE_NAMES.REGISTER}
                                className="font-medium text-(--erp-info) transition hover:text-(--erp-info)/80 hover:underline"
                            >
                                Create an account
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
