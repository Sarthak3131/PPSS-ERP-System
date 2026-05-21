import { BOM_SEED } from '../data/mockBOMs';

const STORAGE_KEY = 'ppss_bom_catalog_mock_v1';
const clone = (value) => JSON.parse(JSON.stringify(value));

let memoryState = {
    items: clone(BOM_SEED),
    nextId: 2011,
};

function canUseStorage() {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function normalizeParentProduct(parentProduct) {
    if (!parentProduct) {
        return { id: '', name: '', sku: '', category: '' };
    }

    return {
        id: String(parentProduct.id || '').trim(),
        name: String(parentProduct.name || '').trim(),
        sku: String(parentProduct.sku || '').trim().toUpperCase(),
        category: String(parentProduct.category || '').trim(),
    };
}

function normalizeNode(node, inheritedParentProduct = null) {
    const parentProduct = normalizeParentProduct(node.parentProduct || inheritedParentProduct);
    const children = Array.isArray(node.children) ? node.children : [];

    return {
        id: String(node.id || `bom-${Date.now()}`),
        parentProduct,
        componentName: String(node.componentName || '').trim(),
        componentCode: String(node.componentCode || '').trim().toUpperCase(),
        quantity: Number.isFinite(Number(node.quantity)) ? Number(node.quantity) : 0,
        unit: String(node.unit || '').trim(),
        level: Number.isFinite(Number(node.level)) ? Number(node.level) : 0,
        status: String(node.status || 'Draft').trim(),
        revision: String(node.revision || 'A').trim().toUpperCase(),
        supplier: String(node.supplier || '').trim(),
        lastUpdated: node.lastUpdated || new Date().toISOString(),
        notes: String(node.notes || '').trim(),
        children: children.map((child) => normalizeNode(child, parentProduct)),
    };
}

function normalizeItems(items) {
    return (Array.isArray(items) ? items : []).map((item) => normalizeNode(item));
}

function createInitialState() {
    return {
        items: normalizeItems(BOM_SEED),
        nextId: 2011,
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
            const state = { items: normalizeItems(parsed), nextId: 2011 };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return state;
        }

        return {
            items: normalizeItems(parsed.items),
            nextId: Number(parsed.nextId) || 2011,
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

function nextIdentifier(state) {
    const id = `bom-${state.nextId}`;
    state.nextId += 1;
    return id;
}

function mapTree(items, mapper) {
    return items.map((item) => {
        const nextItem = mapper(item);
        return {
            ...nextItem,
            children: mapTree(nextItem.children || [], mapper),
        };
    });
}

function updateNode(items, targetId, updater) {
    let changed = false;

    const nextItems = items.map((item) => {
        if (String(item.id) === String(targetId)) {
            changed = true;
            return updater(item);
        }

        const [nextChildren, childChanged] = updateNode(item.children || [], targetId, updater);
        if (childChanged) {
            changed = true;
            return { ...item, children: nextChildren };
        }

        return item;
    });

    return [nextItems, changed];
}

function findNodeById(items, targetId) {
    for (const item of items) {
        if (String(item.id) === String(targetId)) {
            return item;
        }

        const match = findNodeById(item.children || [], targetId);
        if (match) {
            return match;
        }
    }

    return null;
}

function removeNode(items, targetId) {
    let removed = false;
    const nextItems = [];

    for (const item of items) {
        if (String(item.id) === String(targetId)) {
            removed = true;
            continue;
        }

        const [nextChildren, childRemoved] = removeNode(item.children || [], targetId);
        if (childRemoved) {
            removed = true;
            nextItems.push({ ...item, children: nextChildren });
            continue;
        }

        nextItems.push(item);
    }

    return [nextItems, removed];
}

function appendTree(items, parentId, node) {
    if (!parentId) {
        return [[node, ...items], true];
    }

    let inserted = false;
    const nextItems = items.map((item) => {
        if (String(item.id) === String(parentId)) {
            inserted = true;
            return { ...item, children: [node, ...(item.children || [])] };
        }

        const [nextChildren, childInserted] = appendTree(item.children || [], parentId, node);
        if (childInserted) {
            inserted = true;
            return { ...item, children: nextChildren };
        }

        return item;
    });

    return [nextItems, inserted];
}

export async function getAllBOMs() {
    const state = readState();
    return {
        data: clone(state.items),
        meta: { total: state.items.length },
    };
}

export async function tree() {
    return getAllBOMs();
}

export async function getAll(params = {}) {
    return getAllBOMs(params);
}

export async function createBOM(payload) {
    const state = readState();

    const nextItem = normalizeNode(
        {
            ...payload,
            id: nextIdentifier(state),
            level: 0,
            status: payload.status || 'Draft',
            revision: payload.revision || 'A',
            lastUpdated: new Date().toISOString(),
            children: payload.children || [],
        },
        payload.parentProduct,
    );

    state.items = [nextItem, ...state.items];
    writeState(state);
    return clone(nextItem);
}

export async function updateBOM(id, payload) {
    const state = readState();
    const [nextItems, updated] = updateNode(state.items, id, (item) => normalizeNode({ ...item, ...payload, id: item.id, lastUpdated: new Date().toISOString() }, payload.parentProduct || item.parentProduct));

    if (!updated) {
        throw new Error('BOM record not found.');
    }

    state.items = nextItems;
    writeState(state);
    return clone(findNodeById(nextItems, id));
}

export async function deleteBOM(id) {
    const state = readState();
    const [nextItems, removed] = removeNode(state.items, id);

    if (!removed) {
        throw new Error('BOM record not found.');
    }

    state.items = nextItems;
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
