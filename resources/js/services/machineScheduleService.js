import api from './api';
import { unwrapResponseData } from '../utils/apiEnvelope';

const ASSIGNMENT_CHANGED_EVENT = 'production-order-assignment-changed';

function notifyAssignmentChanged() {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new Event(ASSIGNMENT_CHANGED_EVENT));

    try {
        window.localStorage.setItem(ASSIGNMENT_CHANGED_EVENT, String(Date.now()));
    } catch {
        // Ignore storage failures and keep the request flow intact.
    }
}

export async function timeline() {
    const response = await api.get('/v1/schedules/timeline');
    return unwrapResponseData(response);
}

export async function assignOrder(data) {
    const response = await api.post('/v1/schedules/assign', data);
    const payload = unwrapResponseData(response);
    notifyAssignmentChanged();
    return payload;
}

export async function updateSchedule(scheduleId, data) {
    const response = await api.put(`/v1/schedules/${scheduleId}`, data);
    const payload = unwrapResponseData(response);
    notifyAssignmentChanged();
    return payload;
}

export async function removeOrder(scheduleId) {
    const response = await api.post(`/v1/schedules/${scheduleId}/remove`);
    const payload = unwrapResponseData(response);
    notifyAssignmentChanged();
    return payload;
}
