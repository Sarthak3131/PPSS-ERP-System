import api from './api';
import { unwrapResponseData } from '../utils/apiEnvelope';

export async function getAll(params = {}) {
    const response = await api.get('/v1/machines', { params });
    return unwrapResponseData(response);
}

export async function utilization() {
    const response = await api.get('/v1/machines/utilization');
    return unwrapResponseData(response);
}
