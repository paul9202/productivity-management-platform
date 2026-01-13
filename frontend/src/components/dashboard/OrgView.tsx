import React, { useState } from 'react';
import { DepartmentStats } from '../../types/dashboard';
import { LayoutGrid, List } from 'lucide-react';

interface Props {
    departments: DepartmentStats[];
}

export const OrgView: React.FC<Props> = ({ departments }) => {
    const [view, setView] = useState<'LIST' | 'HEATMAP'>('LIST');

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Department Performace</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setView('LIST')}
                        className="btn-icon"
                        style={{ color: view === 'LIST' ? 'var(--primary)' : 'inherit', background: view === 'LIST' ? '#eff6ff' : 'transparent' }}
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => setView('HEATMAP')}
                        className="btn-icon"
                        style={{ color: view === 'HEATMAP' ? 'var(--primary)' : 'inherit', background: view === 'HEATMAP' ? '#eff6ff' : 'transparent' }}
                    >
                        <LayoutGrid size={18} />
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                {view === 'LIST' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '0.5rem' }}>Department</th>
                                <th style={{ padding: '0.5rem' }}>Users</th>
                                <th style={{ padding: '0.5rem' }}>Focus Index</th>
                                <th style={{ padding: '0.5rem' }}>Risk Score</th>
                                <th style={{ padding: '0.5rem' }}>Idle Ratio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(dept => (
                                <tr key={dept.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{dept.name}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{dept.userCount}</td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${dept.focusIndex}%`, height: '100%', background: '#4f46e5' }} />
                                            </div>
                                            <span style={{ fontSize: '0.85rem' }}>{dept.focusIndex}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', color: dept.riskScore > 20 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                                        {dept.riskScore}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem' }}>{dept.idleRatio}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {departments.map(dept => {
                            // Heatmap color logic
                            const intensity = dept.focusIndex < 50 ? '#fee2e2' : dept.focusIndex < 70 ? '#fef9c3' : '#dcfce7';
                            const borderColor = dept.focusIndex < 50 ? '#fecaca' : dept.focusIndex < 70 ? '#fde047' : '#bbf7d0';

                            return (
                                <div key={dept.id} style={{
                                    padding: '1rem', background: intensity, border: `1px solid ${borderColor}`,
                                    borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.1s'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{dept.name}</h4>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Focus: <strong>{dept.focusIndex}</strong></div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk: <strong>{dept.riskScore}</strong></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
