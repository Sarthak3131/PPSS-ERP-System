import api from './api';
import { parseSuccessPayload } from '../utils/apiEnvelope';

export const updateProfile = async (data) => {
    const response = await api.put('/v1/me', data, {
        withCredentials: true,
    });
    return parseSuccessPayload(response).data;
};
