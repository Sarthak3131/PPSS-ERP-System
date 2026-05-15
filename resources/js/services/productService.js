import api from './api';
import { parseSuccessPayload } from '../utils/apiEnvelope';

export async function getAll(params = {}) {
    const response = await api.get('/v1/products', { params });
    return parseSuccessPayload(response);
}

export async function getById(id) {
    const response = await api.get(`/v1/products/${id}`);
    return parseSuccessPayload(response).data;
}
