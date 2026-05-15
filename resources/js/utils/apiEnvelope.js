/**
 * Strict JSON envelope parser for Laravel API responses.
 * Success shape: { success: true, data, message, meta?, links? }
 */

export class ApiEnvelopeError extends Error {
    constructor(message, code, status) {
        super(message);
        this.name = 'ApiEnvelopeError';
        this.code = code;
        this.status = status;
    }
}

export function unwrapResponseData(response) {
    const body = response?.data;
    if (body && typeof body === 'object' && body.data !== undefined) {
        return body.data;
    }
    return body;
}

/**
 * @param {import('axios').AxiosResponse} response
 * @returns {{ data: unknown, message: string, meta: object|null, links: object|null }}
 */
export function parseSuccessPayload(response) {
    const body = response.data;
    if (!body || typeof body !== 'object' || body.success !== true) {
        throw new ApiEnvelopeError(
            body && typeof body === 'object' && typeof body.message === 'string'
                ? body.message
                : 'Invalid API response: expected success envelope.',
            'INVALID_ENVELOPE',
            response.status
        );
    }
    return {
        data: body.data,
        message: typeof body.message === 'string' ? body.message : 'OK',
        meta: body.meta ?? null,
        links: body.links ?? null,
    };
}

export function getApiErrorMessage(error) {
    const d = error.response?.data;
    if (d && typeof d === 'object' && d.success === false && typeof d.message === 'string') {
        return d.message;
    }
    if (d && typeof d === 'object' && typeof d.message === 'string') {
        return d.message;
    }
    return error.message || 'Request failed.';
}

export function getFirstValidationMessage(errors) {
    if (!errors || typeof errors !== 'object') return null;
    const key = Object.keys(errors)[0];
    if (!key) return null;
    const first = errors[key];
    if (Array.isArray(first) && first[0]) return String(first[0]);
    return null;
}
