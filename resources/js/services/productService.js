import { PRODUCT_SEED } from '../data/mockProducts';

const STORAGE_KEY = 'ppss_product_catalog_mock_v1';

const clone = (value) => JSON.parse(JSON.stringify(value));

let memoryState = {
    items: clone(PRODUCT_SEED),
    nextId: 1009,
};

function canUseStorage() {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function normalizeItems(items) {
    return (Array.isArray(items) ? items : []).map((item) => ({
        id: item.id || `prod-${Date.now()}`,
        name: String(item.name || '').trim(),
        sku: String(item.sku || '').trim().toUpperCase(),
        category: String(item.category || '').trim(),
        status: String(item.status || 'Draft').trim(),
        basePrice: Number(item.basePrice) || 0,
        sizes: Array.isArray(item.sizes) ? item.sizes.filter(Boolean) : [],
        description: String(item.description || '').trim(),
        active: Boolean(item.active),
        supplierName: String(item.supplierName || '').trim(),
        imageUrl: item.imageUrl || null,
        inventoryStatus: String(item.inventoryStatus || (item.active ? 'In Stock' : 'Archived')).trim(),
        stockOnHand: Number.isFinite(Number(item.stockOnHand)) ? Number(item.stockOnHand) : 0,
        inventoryQuantity: Number.isFinite(Number(item.inventoryQuantity)) ? Number(item.inventoryQuantity) : Number.isFinite(Number(item.stockOnHand)) ? Number(item.stockOnHand) : 0,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
    }));
}

function createInitialState() {
    return {
        items: normalizeItems(PRODUCT_SEED),
        nextId: 1009,
    };
}

function readState() {
    if (!canUseStorage()) {
        return memoryState;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const initial = createInitialState();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            const state = { items: normalizeItems(parsed), nextId: 1009 };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return state;
        }

        const items = normalizeItems(parsed.items);
        return {
            items,
            nextId: Number(parsed.nextId) || 1009,
        };
    } catch {
        const initial = createInitialState();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }
}

function writeState(state) {
    memoryState = {
        items: clone(state.items),
        nextId: state.nextId,
    };

    if (canUseStorage()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
    }
}

function ensureUniqueSku(items, sku, ignoreId = null) {
    const normalizedSku = String(sku || '').trim().toUpperCase();
    const duplicate = items.find((item) => item.sku === normalizedSku && item.id !== ignoreId);
    if (duplicate) {
        throw new Error(`SKU ${normalizedSku} already exists.`);
    }
}

function nextIdentifier(state) {
    const id = `prod-${state.nextId}`;
    state.nextId += 1;
    return id;
}

export async function getAll() {
    const state = readState();
    return {
        data: clone(state.items),
        meta: { total: state.items.length },
    };
}

export async function getById(id) {
    const state = readState();
    return clone(state.items.find((item) => String(item.id) === String(id)) || null);
}

export async function create(payload) {
    const state = readState();
    const items = normalizeItems(state.items);
    ensureUniqueSku(items, payload.sku);

    const nextProduct = normalizeItems([
        {
            ...payload,
            id: nextIdentifier(state),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            inventoryStatus: payload.active ? 'In Stock' : 'Draft',
            stockOnHand: Number(payload.stockOnHand) || 0,
            inventoryQuantity: Number(payload.inventoryQuantity ?? payload.stockOnHand) || 0,
        },
    ])[0];

    state.items = [nextProduct, ...items];
    writeState(state);

    return clone(nextProduct);
}

export async function update(id, payload) {
    const state = readState();
    const index = state.items.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
        throw new Error('Product not found.');
    }

    ensureUniqueSku(state.items, payload.sku, String(id));

    const updated = normalizeItems([
        {
            ...state.items[index],
            ...payload,
            id: state.items[index].id,
            createdAt: state.items[index].createdAt,
            updatedAt: new Date().toISOString(),
            inventoryStatus: payload.inventoryStatus || state.items[index].inventoryStatus,
            stockOnHand: Number.isFinite(Number(payload.stockOnHand)) ? Number(payload.stockOnHand) : state.items[index].stockOnHand,
            inventoryQuantity: Number.isFinite(Number(payload.inventoryQuantity)) ? Number(payload.inventoryQuantity) : state.items[index].inventoryQuantity,
        },
    ])[0];

    state.items = state.items.map((item, itemIndex) => (itemIndex === index ? updated : item));
    writeState(state);

    return clone(updated);
}

export async function remove(id) {
    const state = readState();
    const filtered = state.items.filter((item) => String(item.id) !== String(id));
    if (filtered.length === state.items.length) {
        throw new Error('Product not found.');
    }

    state.items = filtered;
    writeState(state);
    return true;
}

export async function archive(id) {
    const state = readState();
    const index = state.items.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
        throw new Error('Product not found.');
    }

    const archived = normalizeItems([
        {
            ...state.items[index],
            status: 'Archived',
            active: false,
            inventoryStatus: 'Archived',
            inventoryQuantity: 0,
            updatedAt: new Date().toISOString(),
        },
    ])[0];

    state.items = state.items.map((item, itemIndex) => (itemIndex === index ? archived : item));
    writeState(state);
    return clone(archived);
}

export async function duplicate(id) {
    const state = readState();
    const source = state.items.find((item) => String(item.id) === String(id));
    if (!source) {
        throw new Error('Product not found.');
    }

    let skuBase = `${source.sku}-COPY`;
    let copySku = skuBase;
    let suffix = 2;
    while (state.items.some((item) => item.sku === copySku)) {
        copySku = `${skuBase}-${suffix}`;
        suffix += 1;
    }

    const cloneItem = normalizeItems([
        {
            ...source,
            id: nextIdentifier(state),
            name: `${source.name} Copy`,
            sku: copySku,
            status: 'Draft',
            active: false,
            inventoryStatus: 'Draft',
            inventoryQuantity: Number(source.inventoryQuantity) || Number(source.stockOnHand) || 0,
            stockOnHand: Number(source.stockOnHand) || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ])[0];

    state.items = [cloneItem, ...state.items];
    writeState(state);
    return clone(cloneItem);
}

export async function bulkRemove(ids = []) {
    const state = readState();
    const idSet = new Set((Array.isArray(ids) ? ids : []).map((item) => String(item)));
    state.items = state.items.filter((item) => !idSet.has(String(item.id)));
    writeState(state);
    return true;
}

export async function bulkArchive(ids = []) {
    const state = readState();
    const idSet = new Set((Array.isArray(ids) ? ids : []).map((item) => String(item)));
    state.items = state.items.map((item) => {
        if (!idSet.has(String(item.id))) return item;
        return normalizeItems([
            {
                ...item,
                status: 'Archived',
                active: false,
                inventoryStatus: 'Archived',
                inventoryQuantity: 0,
                updatedAt: new Date().toISOString(),
            },
        ])[0];
    });
    writeState(state);
    return true;
}

export async function resetMockData() {
    const initial = createInitialState();
    writeState(initial);
    return {
        data: clone(initial.items),
        meta: { total: initial.items.length },
    };
}

