import React from 'react';
import { useTheme, Theme } from '../../context/ThemeContext';
import { Moon, Sun, Monitor, Droplets, Grape } from 'lucide-react';

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    // Map themes to icons
    const icons: Record<Theme, React.ReactNode> = {
        system: <Monitor size={16} />,
        light: <Sun size={16} />,
        dark: <Moon size={16} />,
        ocean: <Droplets size={16} />,
        grape: <Grape size={16} />
    };

    const themes: Theme[] = ['system', 'light', 'dark', 'ocean', 'grape'];

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-body)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            {themes.map((t) => (
                <button
                    key={t}
                    onClick={() => setTheme(t)}
                    title={t.charAt(0).toUpperCase() + t.slice(1)}
                    style={{
                        background: theme === t ? 'var(--bg-surface)' : 'transparent',
                        color: theme === t ? 'var(--primary)' : 'var(--text-muted)',
                        border: theme === t ? '1px solid var(--border-focus)' : 'none',
                        borderRadius: '4px',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: theme === t ? 'var(--shadow-sm)' : 'none',
                    }}
                >
                    {icons[t]}
                </button>
            ))}
        </div>
    );
};
