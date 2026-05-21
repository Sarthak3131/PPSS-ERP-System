import { PRODUCTION_ORDER_SEED } from '../data/mockProductionOrders';

const STORAGE_KEY = 'ppss_production_orders_mock_v1';
const clone = (v) => JSON.parse(JSON.stringify(v));

let memoryState = {
    items: clone(PRODUCTION_ORDER_SEED),
    nextId: 3001,
};

function canUseStorage() {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function createInitialState() {
    return { items: clone(PRODUCTION_ORDER_SEED), nextId: 3001 };
}

function readState() {
    if (!canUseStorage()) return memoryState;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const initial = createInitialState();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            const state = { items: clone(parsed), nextId: 3001 };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return state;
        }

        return { items: clone(parsed.items || []), nextId: Number(parsed.nextId) || 3001 };
    } catch {
        const initial = createInitialState();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }
}

function writeState(state) {
    memoryState = { items: clone(state.items), nextId: state.nextId };
    if (canUseStorage()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
}

function nextIdentifier(state) {
    const id = `PO-2026-${String(state.nextId).padStart(4, '0')}`;
    state.nextId += 1;
    return id;
}

export async function getAllProductionOrders() {
    const state = readState();
    return { data: clone(state.items), meta: { total: state.items.length } };
}

export async function getAll() {
    return getAllProductionOrders();
}

export async function createOrder(payload) {
    const state = readState();

    const id = nextIdentifier(state);
    const next = {
        id,
        orderCode: payload.orderCode || id,
        product: payload.product || null,
        bomRef: payload.bomRef || null,
        quantity: Number(payload.quantity) || 0,
        priority: payload.priority || 'Medium',
        machine: payload.machine || '',
        shift: payload.shift || 'Day',
        stage: payload.stage || 'Planned',
        status: payload.status || 'Planned',
        dueDate: payload.dueDate || new Date().toISOString(),
        progress: Number(payload.progress) || 0,
        runtimeEstimateMins: Number(payload.runtimeEstimateMins) || 0,
        materialReadiness: payload.materialReadiness || 'Pending',
        team: payload.team || '',
        qaNotes: payload.qaNotes || '',
        remarks: payload.remarks || '',
        createdAt: new Date().toISOString(),
    };

    state.items = [next, ...state.items];
    writeState(state);
    return clone(next);
}

export async function updateOrder(id, payload) {
    const state = readState();
    let found = false;
    const items = state.items.map((item) => {
        if (String(item.id) === String(id)) {
            found = true;
            return { ...item, ...payload, id: item.id };
        }
        return item;
    });

    if (!found) throw new Error('Production order not found.');

    state.items = items;
    writeState(state);
    return clone(items.find((i) => String(i.id) === String(id)));
}

export async function deleteOrder(id) {
    const state = readState();
    const next = state.items.filter((item) => String(item.id) !== String(id));
    if (next.length === state.items.length) throw new Error('Production order not found.');
    state.items = next;
    writeState(state);
    return true;
}

export async function resetMockData() {
    const initial = createInitialState();
    writeState(initial);
    return { data: clone(initial.items), meta: { total: initial.items.length } };
}

