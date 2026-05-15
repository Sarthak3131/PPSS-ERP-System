import { STORAGE_KEYS } from './constants';

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
};

export const THEME_META = {
    [THEMES.LIGHT]: {
        label: 'Light',
        nextLabel: 'Switch to dark mode',
    },
    [THEMES.DARK]: {
        label: 'Dark',
        nextLabel: 'Switch to light mode',
    },
};

export function normalizeTheme(theme) {
    if (theme === THEMES.SYSTEM) return THEMES.SYSTEM;
    return theme === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
}

export function getPreferredTheme() {
    if (typeof window === 'undefined') {
        return THEMES.LIGHT;
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEYS.THEME);
    if (storedTheme) {
        return normalizeTheme(storedTheme);
    }

    return THEMES.LIGHT;
}

export function applyTheme(theme) {
    if (typeof document === 'undefined') {
        return THEMES.LIGHT;
    }

    const normalized = normalizeTheme(theme);
    const root = document.documentElement;
    const body = document.body;

    // Determine applied theme: if 'system' use prefers-color-scheme
    const applied = normalized === THEMES.SYSTEM
        ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT)
        : normalized;

    // Apply Tailwind dark class on html and body for broad coverage
    root.classList.toggle('dark', applied === THEMES.DARK);
    if (body) body.classList.toggle('dark', applied === THEMES.DARK);

    // Set data-theme to the actually applied theme (light/dark) so vendor CSS matches
    root.dataset.theme = applied;
    root.style.colorScheme = applied;

    // If system mode requested, listen for changes and re-apply
    if (normalized === THEMES.SYSTEM && window.matchMedia) {
        try {
            // remove previous listener if set
            if (window.__ppss_theme_mql && window.__ppss_theme_mql_listener) {
                window.__ppss_theme_mql.removeEventListener('change', window.__ppss_theme_mql_listener);
            }
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = (e) => {
                const newApplied = e.matches ? THEMES.DARK : THEMES.LIGHT;
                root.classList.toggle('dark', newApplied === THEMES.DARK);
                if (body) body.classList.toggle('dark', newApplied === THEMES.DARK);
                root.dataset.theme = newApplied;
                root.style.colorScheme = newApplied;
            };
            mql.addEventListener ? mql.addEventListener('change', listener) : mql.addListener(listener);
            window.__ppss_theme_mql = mql;
            window.__ppss_theme_mql_listener = listener;
        } catch (err) {
            // ignore addEventListener failures on older browsers
        }
    } else {
        // remove any existing system listener when explicitly setting light/dark
        if (window.__ppss_theme_mql && window.__ppss_theme_mql_listener) {
            try {
                window.__ppss_theme_mql.removeEventListener('change', window.__ppss_theme_mql_listener);
            } catch (e) {
                try { window.__ppss_theme_mql.removeListener(window.__ppss_theme_mql_listener); } catch (_) {}
            }
            window.__ppss_theme_mql = null;
            window.__ppss_theme_mql_listener = null;
        }
    }

    return applied;
}

export function saveTheme(theme) {
    if (typeof window !== 'undefined') {
        // Persist the raw value (including 'system')
        window.localStorage.setItem(STORAGE_KEYS.THEME, theme === THEMES.SYSTEM ? THEMES.SYSTEM : normalizeTheme(theme));
    }
}

export function initializeTheme() {
    const initialTheme = getPreferredTheme();
    // ensure stored value remains (do not overwrite 'system')
    if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem(STORAGE_KEYS.THEME);
        if (!stored) saveTheme(initialTheme);
    }
    return applyTheme(initialTheme);
}

export function getNextTheme(theme) {
    return normalizeTheme(theme) === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
}
