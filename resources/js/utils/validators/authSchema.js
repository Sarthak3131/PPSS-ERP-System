import { z } from 'zod';

export const authSchema = z.object({
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().default(false),
});

export const loginSchema = authSchema;

export const registerSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
