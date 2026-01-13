import React, { useState } from 'react';
import { Bot, Copy, Download, X } from 'lucide-react';
import { DashboardData, ExecutiveBrief } from '../../types/dashboard';
import { generateExecutiveBrief } from '../../features/dashboard/logic/copilotGenerator';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: DashboardData;
    scopeName: string;
}

export const CopilotModal: React.FC<Props> = ({ isOpen, onClose, data, scopeName }) => {
    const [reportType, setReportType] = useState<'DAILY' | 'WEEKLY' | 'COMPLIANCE'>('DAILY');
    const [brief, setBrief] = useState<ExecutiveBrief | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const generate = () => {
        setLoading(true);
        setTimeout(() => {
            setBrief(generateExecutiveBrief(data, reportType, scopeName));
            setLoading(false);
        }, 1000);
    };

    const handleCopy = () => {
        if (!brief) return;
        const text = `EXECUTIVE BRIEF - ${brief.type}\nTarget: ${brief.target}\n\nSUMMARY:\n${brief.summary}\n\nTOP ISSUES:\n${brief.topIssues.map(i => `- ${i.title} (${i.severity})`).join('\n')}\n\nCONCLUSION:\n${brief.conclusion}`;
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard');
    };

    return (
        <div className="modal-overlay open" style={{ zIndex: 1000 }}>
            <div className="modal-content open" style={{ maxWidth: '600px', width: '90%' }}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Bot size={24} color="#7c3aed" />
                        AI Executive Brief
                    </h2>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {!brief ? (
                        <>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Select a report template to generate a natural language summary.</p>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                {['DAILY', 'WEEKLY', 'COMPLIANCE'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setReportType(t as any)}
                                        className="card"
                                        style={{
                                            flex: 1, padding: '1rem', textAlign: 'center',
                                            border: reportType === t ? '2px solid #7c3aed' : '1px solid var(--border-subtle)',
                                            background: reportType === t ? '#f3e8ff' : 'var(--bg-surface)'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{t}</div>
                                    </button>
                                ))}
                            </div>
                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#7c3aed' }} onClick={generate} disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Brief'}
                            </button>
                        </>
                    ) : (
                        <div>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', color: '#475569' }}>{brief.type} Report</h3>
                                <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{brief.summary}</p>

                                <h4 style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>Top Issues</h4>
                                <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                                    {brief.topIssues.map(i => <li key={i.id}>{i.title}</li>)}
                                </ul>

                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#dcfce7', borderRadius: '6px', fontSize: '0.9rem', color: '#166534' }}>
                                    {brief.conclusion}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button className="btn-text" onClick={() => setBrief(null)}>Back</button>
                                <button className="btn-primary" onClick={handleCopy}><Copy size={16} /> Copy</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
