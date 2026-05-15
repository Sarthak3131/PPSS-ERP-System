import api from './api';
import { unwrapResponseData } from '../utils/apiEnvelope';

export async function getAll(params = {}) {
    const response = await api.get('/v1/inventory', { params });
    return unwrapResponseData(response);
}

export async function create(data) {
    const response = await api.post('/v1/inventory', data);
    return unwrapResponseData(response);
}

export async function update(id, data) {
    const response = await api.put(`/v1/inventory/${id}`, data);
    return unwrapResponseData(response);
}

export async function remove(id) {
    const response = await api.delete(`/v1/inventory/${id}`);
    return unwrapResponseData(response);
}

export async function alerts() {
    const response = await api.get('/v1/inventory-alerts');
    return unwrapResponseData(response);
}
