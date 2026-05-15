import api from './api';
import { unwrapResponseData } from '../utils/apiEnvelope';

export async function getAll(params = {}) {
    const response = await api.get('/v1/orders', { params });
    return unwrapResponseData(response);
}

export async function create(data) {
    const response = await api.post('/v1/orders', data);
    return unwrapResponseData(response);
}

export async function update(id, data) {
    const response = await api.put(`/v1/orders/${id}`, data);
    return unwrapResponseData(response);
}

export async function remove(id) {
    const response = await api.delete(`/v1/orders/${id}`);
    return unwrapResponseData(response);
}

export async function release(id) {
    const response = await api.post(`/v1/orders/${id}/release`);
    return unwrapResponseData(response);
}

export async function cancel(id) {
    const response = await api.post(`/v1/orders/${id}/cancel`);
    return unwrapResponseData(response);
}
