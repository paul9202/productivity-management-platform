import React from 'react';
import { TopIssue } from '../../types/dashboard';
import { AlertTriangle, TrendingDown, ShieldAlert, ArrowRight, Zap } from 'lucide-react';

interface Props {
    issues: TopIssue[];
}

export const ActionCenter: React.FC<Props> = ({ issues }) => {
    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={20} className="text-yellow-500" style={{ fill: '#fbbf24', color: '#b45309' }} />
                    Action Center
                    <span className="badge badge-error" style={{ fontSize: '0.75rem' }}>{issues.length} Issues</span>
                </h3>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                {issues.map(issue => (
                    <div key={issue.id} style={{
                        marginBottom: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-body)',
                        borderLeft: `4px solid ${issue.severity === 'P1' ? '#dc2626' : issue.severity === 'P2' ? '#f59e0b' : '#3b82f6'}`
                    }}>
                        <div className="flex-row space-between" style={{ alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{issue.title}</div>
                            <span style={{
                                fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                                background: issue.severity === 'P1' ? '#fee2e2' : '#fef3c7',
                                color: issue.severity === 'P1' ? '#991b1b' : '#92400e'
                            }}>{issue.severity}</span>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{issue.evidence}</p>

                        <div className="flex-row space-between" style={{ marginTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Impact: <strong>{issue.impact}</strong></span>
                            <button className="btn-text" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}>
                                {issue.recommendation.label} <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
