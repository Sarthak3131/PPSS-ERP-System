import React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import useAppStore from '../store/appStore';
import { applyTheme, getNextTheme, saveTheme, THEMES } from '../utils/theme';
import Button from './ui/Button';

export default function ThemeToggle() {
    const theme = useAppStore((state) => state.theme);
    const setTheme = useAppStore((state) => state.setTheme);

    const handleToggle = () => {
        const nextTheme = getNextTheme(theme);
        setTheme(nextTheme);
        saveTheme(nextTheme);
        applyTheme(nextTheme);
    };

    const isDarkMode = theme === THEMES.DARK;

    return (
        <Button
            type="button"
            onClick={handleToggle}
            variant="secondary"
            size="sm"
            aria-pressed={isDarkMode}
            aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            leftIcon={isDarkMode ? SunIcon : MoonIcon}
        >
            <span className="hidden sm:inline">{isDarkMode ? 'Dark' : 'Light'}</span>
        </Button>
    );
}
