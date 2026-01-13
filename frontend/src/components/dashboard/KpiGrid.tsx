import React from 'react';
import { ExecutiveKPIs, KpiMetric } from '../../types/dashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
    kpis: ExecutiveKPIs;
    viewMode: 'PRODUCTIVITY' | 'RISK' | 'HEALTH';
}

const KpiCard: React.FC<{ metric: KpiMetric }> = ({ metric }) => {
    let trendColor = 'var(--text-muted)';
    let Icon = Minus;
    if (metric.trend) {
        if (metric.trend.direction === 'up') Icon = TrendingUp;
        if (metric.trend.direction === 'down') Icon = TrendingDown;
        if (metric.trend.isGood) {
            trendColor = '#16a34a'; // Green
        } else if (metric.trend.direction !== 'flat') {
            trendColor = '#dc2626'; // Red
        }
    }

    const cardBorderColor = metric.color === 'danger' ? '#fecaca' :
        metric.color === 'warning' ? '#fde047' :
            metric.color === 'success' ? '#bbf7d0' : 'transparent';
    const cardBg = metric.color === 'danger' ? '#fef2f2' : 'var(--bg-surface)';

    return (
        <div className="card" style={{ padding: '1.25rem', minWidth: '200px', flex: 1, border: metric.color ? `1px solid ${cardBorderColor}` : undefined, background: cardBg }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {metric.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{metric.value}</h3>
                {metric.unit && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{metric.unit}</span>}
            </div>
            {metric.trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: trendColor }}>
                    <Icon size={14} />
                    <span style={{ fontWeight: 600 }}>{Math.abs(metric.trend.value)}%</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{metric.trend.label || 'vs last period'}</span>
                </div>
            )}
        </div>
    );
};

export const KpiGrid: React.FC<Props> = ({ kpis, viewMode }) => {
    // Select KPIs based on View Mode
    const metrics: KpiMetric[] = [];

    // Always show generic health/online
    metrics.push(kpis.onlineDevices);

    if (viewMode === 'PRODUCTIVITY') {
        metrics.push(kpis.activeMinutes);
        metrics.push(kpis.focusIndex);
        metrics.push(kpis.productiveAppShare);
    } else if (viewMode === 'RISK') {
        metrics.push(kpis.riskAlerts);
        metrics.push(kpis.idleRatio); // Idle often correlates with risk or nothingness
        metrics.push(kpis.policyCompliance);
    } else {
        // Health
        metrics.push(kpis.dataHealth);
        metrics.push(kpis.policyCompliance);
        metrics.push(kpis.activeMinutes); // Activity as health proxy
    }

    // Fill rest if needed, or just show 4 relevant ones for now to keep it clean, 
    // or show ALL 8 if user wants "Executive Overview - All". 
    // The requirement said "At least 8 cards". Let's show all 8 in 2 rows.

    const allMetrics = Object.values(kpis);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {allMetrics.map(m => <KpiCard key={m.id} metric={m} />)}
        </div>
    );
};
