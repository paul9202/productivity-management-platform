import React from 'react';
import { TelemetrySummary, InsightItem } from '../../types/telemetry';
import {
    Activity, Clock, AlertTriangle, ShieldAlert, Monitor,
    Wifi, WifiOff, LayoutGrid, FileText
} from 'lucide-react';

interface Props {
    summary: TelemetrySummary;
    insights: InsightItem[];
    managerSnapshot: string;
}

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; subtext?: string; status?: 'success' | 'danger' | 'neutral' }> = ({
    title, value, icon, subtext, status = 'neutral'
}) => {
    let bg = 'var(--bg-surface)';
    let border = 'var(--border-subtle)';
    if (status === 'danger') { bg = '#fee2e2'; border = '#fecaca'; }
    if (status === 'success') { bg = '#dcfce7'; border = '#bbf7d0'; }

    return (
        <div className="card" style={{ background: bg, borderColor: border }}>
            <div className="flex-row space-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.05)' }}>
                    {icon}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</h3>
                {subtext && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{subtext}</span>}
            </div>
        </div>
    );
};

const RiskCounter: React.FC<{ count: number; label: string; icon: any }> = ({ count, label, icon: Icon }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
        background: count > 0 ? '#fee2e2' : 'var(--bg-surface)'
    }}>
        <div style={{
            padding: '0.375rem', borderRadius: '4px',
            background: count > 0 ? '#fecaca' : '#f1f5f9',
            color: count > 0 ? '#b91c1c' : '#64748b'
        }}>
            <Icon size={16} />
        </div>
        <div>
            <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: count > 0 ? '#b91c1c' : '#334155', margin: 0, lineHeight: 1 }}>{count}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
        </div>
    </div>
);

export const ExecutiveSummary: React.FC<Props> = ({ summary, insights, managerSnapshot }) => {
    const activeHrs = (summary.totalActiveSeconds / 3600).toFixed(1);
    const idleHrs = (summary.totalIdleSeconds / 3600).toFixed(1);
    const riskCount = insights.filter(i => i.category === 'RISK').length; // Use calculated insights, not just raw counters

    // Status Logic
    const isOnline = summary.status.online;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Manager Snapshot Banner */}
            <div style={{
                background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
                border: '1px solid #dbeafe', borderRadius: 'var(--radius-lg)',
                padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem'
            }}>
                <div style={{ padding: '0.5rem', background: '#dbeafe', color: '#2563eb', borderRadius: '8px' }}>
                    <LayoutGrid size={20} />
                </div>
                <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Manager Snapshot</h4>
                    <p style={{ color: '#1e40af', fontSize: '0.875rem', lineHeight: '1.5' }}>
                        {managerSnapshot || "Analyzing recent telemetry for activity patterns..."}
                    </p>
                </div>
            </div>

            {/* Main KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <KPICard
                    title="Active Time"
                    value={`${activeHrs}h`}
                    subtext={`Score: ${summary.productivityScore}`}
                    icon={<Activity size={20} />}
                />
                <KPICard
                    title="Idle Time"
                    value={`${idleHrs}h`}
                    icon={<Clock size={20} />}
                />
                <KPICard
                    title="Risk Level"
                    value={riskCount > 0 ? 'High' : 'Low'}
                    subtext={`${riskCount} alerts`}
                    status={riskCount > 0 ? 'danger' : 'neutral'}
                    icon={<ShieldAlert size={20} style={{ color: riskCount > 0 ? '#b91c1c' : 'inherit' }} />}
                />
                <KPICard
                    title="Device Status"
                    value={isOnline ? 'Online' : 'Offline'}
                    subtext={`Last seen: ${new Date(summary.status.lastSeenAt).toLocaleTimeString()}`}
                    status={isOnline ? 'success' : 'neutral'}
                    icon={isOnline ? <Wifi size={20} style={{ color: '#16a34a' }} /> : <WifiOff size={20} />}
                />
            </div>

            {/* Risk Detail Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <RiskCounter label="Blocked Sites" count={summary.riskCounters.blocks} icon={ShieldAlert} />
                <RiskCounter label="Sens. Keywords" count={summary.riskCounters.sensitiveKeywords} icon={FileText} />
                <RiskCounter label="USB Events" count={summary.riskCounters.usbEvents} icon={AlertTriangle} />
                <RiskCounter label="Anomalies" count={summary.riskCounters.anomalies} icon={Monitor} />
            </div>
        </div>
    );
};
