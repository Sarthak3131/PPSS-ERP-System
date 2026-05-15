import api from './api';
import { parseSuccessPayload } from '../utils/apiEnvelope';

export async function getAll(params = {}) {
    const response = await api.get('/v1/notifications', { params });
    return parseSuccessPayload(response);
}

export async function markRead(id) {
    const response = await api.post(`/v1/notifications/${id}/read`);
    return parseSuccessPayload(response).data;
}

export async function markAllRead() {
    const response = await api.post('/v1/notifications/read-all');
    return parseSuccessPayload(response).data;
}

export async function remove(id) {
    const response = await api.delete(`/v1/notifications/${id}`);
    return parseSuccessPayload(response).data;
}
