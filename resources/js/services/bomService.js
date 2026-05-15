import api from './api';
import { parseSuccessPayload } from '../utils/apiEnvelope';

export async function tree() {
    const response = await api.get('/v1/bill-of-materials/tree');
    return parseSuccessPayload(response).data;
}

export async function getAll(params = {}) {
    const response = await api.get('/v1/bill-of-materials', { params });
    return parseSuccessPayload(response);
}
