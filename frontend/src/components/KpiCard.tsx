import React from 'react';

interface Props {
    title: string;
    value: string | number;
    trend?: { value: number; label: string }; // e.g. +5% vs yesterday
    color?: string;
}

export const KpiCard: React.FC<Props> = ({ title, value, trend, color = 'var(--text-primary)' }) => {
    return (
        <div className="card" style={{ flex: 1 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color }}>{value}</div>
            {trend && (
                <div style={{ fontSize: '0.75rem', marginTop: 8, color: trend.value >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                    {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                </div>
            )}
        </div>
    );
};
