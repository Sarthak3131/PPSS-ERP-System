import axios from 'axios';
import api from './api';
import { parseSuccessPayload } from '../utils/apiEnvelope';

async function bootstrapCsrf() {
    await axios.get('/sanctum/csrf-cookie', {
        withCredentials: true,
    });
}

export const authService = {
    login: async (credentials) => {
        await bootstrapCsrf();
        const payload = {
            email: credentials.email,
            password: credentials.password,
        };
        const response = await api.post('/v1/login', payload, {
            withCredentials: true,
        });
        return parseSuccessPayload(response).data;
    },
    logout: async () => {
        const response = await api.post(
            '/v1/logout',
            {},
            {
                withCredentials: true,
            }
        );
        return parseSuccessPayload(response).data;
    },
    me: async () => {
        const response = await api.get('/v1/me', {
            withCredentials: true,
            skipAuthHandler: true,
        });
        return parseSuccessPayload(response).data;
    },
    register: async ({ name, email, password, password_confirmation }) => {
        await bootstrapCsrf();
        const response = await api.post(
            '/v1/register',
            {
                name,
                email,
                password,
                password_confirmation,
            },
            {
                withCredentials: true,
            }
        );
        return parseSuccessPayload(response).data;
    },
};
