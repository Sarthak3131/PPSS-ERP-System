import api from './api';
import { unwrapResponseData } from '../utils/apiEnvelope';

export async function productionSummary(params = {}) {
    const response = await api.get('/v1/reports/production-summary', { params });
    return unwrapResponseData(response);
}

export async function productionTrend(params = {}) {
    const response = await api.get('/v1/reports/production-trend', { params });
    return unwrapResponseData(response);
}

export async function machineUtilization(params = {}) {
    const response = await api.get('/v1/reports/machine-utilization', { params });
    return unwrapResponseData(response);
}

export async function inventoryRisk(params = {}) {
    const response = await api.get('/v1/reports/inventory-risk', { params });
    return unwrapResponseData(response);
}

export async function activityLog(page = 1, params = {}) {
    const response = await api.get('/v1/reports/activity-log', { params: { page, ...params } });
    return unwrapResponseData(response);
}

export async function exportOrders(params = {}) {
    const response = await api.get('/v1/reports/export/orders', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'production_orders.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
}

export async function exportInventory(params = {}) {
    const response = await api.get('/v1/reports/export/inventory', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
}
