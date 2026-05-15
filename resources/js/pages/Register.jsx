import React from 'react';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { registerSchema } from '../utils/validators/authSchema';
import { ROUTE_NAMES } from '../utils/constants';
import Button from '../components/ui/Button';
import FormInput from '../components/ui/FormInput';

export default function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, registerAccount } = useAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (formData) => {
        setIsLoading(true);
        setError(null);
        try {
            await registerAccount({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
            });
            navigate(ROUTE_NAMES.LOGIN, {
                replace: true,
                state: { message: 'Registration successful! Please sign in.' },
            });
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (isAuthenticated) {
            const redirectTo = location.state?.from || ROUTE_NAMES.DASHBOARD;
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, location.state, navigate]);

    return (
        <div className="mx-auto grid w-full max-w-6xl min-h-[700px] overflow-hidden rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-surface)] shadow-xl md:grid-cols-2 items-stretch">
            {/* Left Hero */}
            <div className="relative flex w-full h-full flex-col justify-center bg-gradient-to-br from-[var(--erp-surface-muted)] to-[var(--erp-bg)] p-12 lg:p-16">
                <div className="absolute inset-0 bg-[var(--erp-primary)]/5 backdrop-blur-3xl" />
                <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col justify-center space-y-6">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-[var(--erp-primary)]">PPSS ERP</p>
                        <h1 className="mt-2 text-5xl leading-tight font-bold text-[var(--erp-ink)]">Production Planning & Scheduling System</h1>
                        <p className="mt-4 text-lg leading-8 max-w-md text-[var(--erp-muted)]">Centralized production scheduling, machine allocation, and workflow orchestration.</p>
                    </div>
                    
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-[var(--erp-muted)]">
                            <CheckCircleIcon className="h-6 w-6 text-[var(--erp-primary)]" />
                            <span className="text-base font-medium">Smart production scheduling</span>
                        </li>
                        <li className="flex items-center gap-3 text-[var(--erp-muted)]">
                            <CheckCircleIcon className="h-6 w-6 text-[var(--erp-primary)]" />
                            <span className="text-base font-medium">Real-time machine allocation</span>
                        </li>
                        <li className="flex items-center gap-3 text-[var(--erp-muted)]">
                            <CheckCircleIcon className="h-6 w-6 text-[var(--erp-primary)]" />
                            <span className="text-base font-medium">Workflow visibility across teams</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Form */}
            <div className="flex w-full items-center justify-center px-8 py-12">
                <div className="w-full max-w-md rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-surface)] p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-[var(--erp-ink)]">Create Planner Account</h2>
                    <p className="mt-2 text-base text-[var(--erp-muted)]">Register to access the production workflow system.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                        <FormInput
                            id="name"
                            type="text"
                            autoFocus
                            autoComplete="name"
                            label="Full Name"
                            placeholder="Enter full name"
                            error={errors.name?.message}
                            className="w-full"
                            {...register('name')}
                        />

                        <FormInput
                            id="email"
                            type="email"
                            autoComplete="email"
                            label="Email"
                            placeholder="Enter email address"
                            error={errors.email?.message}
                            className="w-full"
                            {...register('email')}
                        />

                        <FormInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            label="Password"
                            placeholder="Minimum 8 characters with one number"
                            error={errors.password?.message}
                            className="w-full"
                            rightAdornment={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="rounded-lg p-2 text-[var(--erp-muted)] transition hover:bg-[var(--erp-surface-muted)] hover:text-[var(--erp-ink)]"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            }
                            {...register('password')}
                        />

                        <FormInput
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            error={errors.confirmPassword?.message}
                            className="w-full"
                            rightAdornment={
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((value) => !value)}
                                    className="rounded-lg p-2 text-[var(--erp-muted)] transition hover:bg-[var(--erp-surface-muted)] hover:text-[var(--erp-ink)]"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            }
                            {...register('confirmPassword')}
                        />

                        {error ? (
                            <div className="rounded-xl border border-[var(--erp-danger)]/40 bg-[var(--erp-danger)]/10 px-4 py-3 text-sm text-[var(--erp-danger)]">
                                {error}
                            </div>
                        ) : null}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full hover:scale-[1.01] active:scale-[0.99] transition-all"
                            loading={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Register'}
                        </Button>

                        <p className="text-center text-xs text-[var(--erp-muted)]">
                            Protected by enterprise-grade access control.
                        </p>

                        <p className="mt-6 text-center text-sm text-[var(--erp-muted)]">
                            Already have account?{' '}
                            <Link
                                to={ROUTE_NAMES.LOGIN}
                                className="font-medium text-[var(--erp-info)] transition hover:text-[var(--erp-info)]/80 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
