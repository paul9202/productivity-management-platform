import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark' | 'ocean' | 'grape';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Initialize from localStorage
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as Theme) || 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        localStorage.setItem('theme', theme);
        const root = document.documentElement;

        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');

            const updateSystemTheme = (matches: boolean) => {
                const res = matches ? 'dark' : 'light';
                root.dataset.theme = res;
                setResolvedTheme(res);
            };

            // Apply immediately
            updateSystemTheme(mq.matches);

            // Listener
            const handler = (e: MediaQueryListEvent) => updateSystemTheme(e.matches);
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        } else {
            // Explicit Theme
            root.dataset.theme = theme;

            // Resolve light/dark status for UI components that rely on it
            // Ocean/Grape are light-based
            const isDark = theme === 'dark';
            setResolvedTheme(isDark ? 'dark' : 'light');
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeState, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
