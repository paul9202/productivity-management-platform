import React from 'react';
import { InsightItem } from '../../types/telemetry';
import { AlertOctagon, AlertTriangle, Info, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
    insights: InsightItem[];
}

const InsightCard: React.FC<{ item: InsightItem }> = ({ item }) => {
    const isP1 = item.severity === 'P1';
    const isP2 = item.severity === 'P2';

    // Colors
    let borderColor = '#93c5fd'; // blue-300
    let bg = '#eff6ff'; // blue-50
    let iconColor = '#2563eb'; // blue-600
    let badgeBg = '#dbeafe'; // blue-100
    let badgeText = '#1e40af'; // blue-800

    if (isP1) {
        borderColor = '#ef4444'; // red-500
        bg = '#fef2f2'; // red-50
        iconColor = '#dc2626'; // red-600
        badgeBg = '#fee2e2'; // red-100
        badgeText = '#991b1b'; // red-800
    } else if (isP2) {
        borderColor = '#fb923c'; // orange-400
        bg = '#fff7ed'; // orange-50
        iconColor = '#ea580c'; // orange-600
        badgeBg = '#ffedd5'; // orange-100
        badgeText = '#9a3412'; // orange-800
    }

    return (
        <div style={{
            padding: '1rem', borderRadius: 'var(--radius-md)',
            borderLeft: `4px solid ${borderColor}`, marginBottom: '0.75rem',
            background: bg, transition: 'background-color 0.2s',
            border: `1px solid ${borderColor}` // Adding full border for better visibility
        }}>
            <div className="flex-row space-between" style={{ marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                <div className="flex-row gap-sm">
                    {isP1 ? <AlertOctagon size={16} color={iconColor} /> :
                        isP2 ? <AlertTriangle size={16} color={iconColor} /> :
                            <Info size={16} color={iconColor} />}
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1f2937' }}>{item.title}</span>
                </div>
                <span style={{
                    fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '4px',
                    fontWeight: 700, fontFamily: 'monospace',
                    background: badgeBg, color: badgeText
                }}>
                    {item.severity}
                </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#4b5563', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {item.evidenceSummary}
            </p>

            <div className="flex-row space-between" style={{ alignItems: 'flex-end' }}>
                <div style={{ fontSize: '0.625rem', color: '#9ca3af' }}>
                    Conf: {item.confidence}% • ID: {item.ruleId}
                </div>
                <button
                    style={{
                        fontSize: '0.75rem', color: '#2563eb', background: 'none',
                        border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => alert(`Details for Rule ${item.ruleId}: \n${JSON.stringify(item.metadata, null, 2)}`)}
                >
                    Details <ChevronRight size={10} />
                </button>
            </div>
        </div>
    );
};

export const InsightsPanel: React.FC<Props> = ({ insights }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
                paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '999px', color: '#475569' }}>
                    {insights.length} Found
                </span>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '600px', paddingRight: '0.5rem' }}>
                {insights.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#9ca3af' }}>
                        <p style={{ fontSize: '0.875rem' }}>No significant patterns detected.</p>
                    </div>
                ) : (
                    insights.map(i => <InsightCard key={i.id} item={i} />)
                )}
            </div>
        </div>
    );
};
