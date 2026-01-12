import React from 'react';

interface Props {
    title: string;
    value: string | number;
    trend?: { value: number; label: string };
    color?: string;
    icon?: React.ReactNode;
}

export const KpiCard: React.FC<Props> = ({ title, value, trend, color, icon }) => {
    return (
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</div>
                {icon && <div style={{ color: 'var(--text-muted)' }}>{icon}</div>}
            </div>

            <div style={{ fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.025em', color: color || 'var(--text-main)', lineHeight: 1 }}>
                {value}
            </div>

            {trend && (
                <div style={{
                    marginTop: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 999,
                    backgroundColor: trend.value >= 0 ? '#dcfce7' : '#fee2e2',
                    color: trend.value >= 0 ? '#166534' : '#991b1b'
                }}>
                    {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
                </div>
            )}
        </div>
    );
};
