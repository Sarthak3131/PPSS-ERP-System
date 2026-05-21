function formatNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

export function formatSizeDimensions(size) {
    if (!size) return '—';

    const width = formatNumber(size.width);
    const height = formatNumber(size.height);
    const diameter = formatNumber(size.diameter);
    const unit = String(size.unit || '').trim();

    if (unit === 'M' && diameter) {
        return `M${diameter}`;
    }

    if (width && height) {
        return unit ? `W ${width} × H ${height} ${unit}` : `W ${width} × H ${height}`;
    }

    if (diameter) {
        return unit === 'inch' ? `${diameter} inch` : `D ${diameter} ${unit}`.trim();
    }

    if (width) {
        return unit ? `W ${width} ${unit}` : `W ${width}`;
    }

    if (height) {
        return unit ? `H ${height} ${unit}` : `H ${height}`;
    }

    return '—';
}

export function formatSizeMeasurementPreview(size) {
    return formatSizeDimensions(size);
}
