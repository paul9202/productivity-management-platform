import React, { useState } from 'react';
import { Bot, Copy, Download, X } from 'lucide-react';
import { convertToMarkdown } from '../../utils/exportUtils';
import { ExecutiveReport } from '../../types/telemetry';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (type: 'EXECUTIVE' | 'MANAGER' | 'COMPLIANCE') => ExecutiveReport;
}

export const AICopilotModal: React.FC<Props> = ({ isOpen, onClose, onGenerate }) => {
    const [reportType, setReportType] = useState<'EXECUTIVE' | 'MANAGER' | 'COMPLIANCE'>('MANAGER');
    const [report, setReport] = useState<ExecutiveReport | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = () => {
        setLoading(true);
        // Simulate "Thinking"
        setTimeout(() => {
            setReport(onGenerate(reportType));
            setLoading(false);
        }, 800);
    };

    const handleCopy = () => {
        if (report) {
            const text = `
REPORT TYPE: ${report.type}
TARGET: ${report.target.name}
Generated: ${new Date(report.generatedAt).toLocaleString()}
------------------------------------------------
SUMMARY:
${report.summary}

KEY INSIGHTS:
${report.keyInsights.map(i => `- [${i.severity}] ${i.title}: ${i.evidenceSummary}`).join('\n')}

TOP ACTIVITY:
Apps: ${report.topActivities.apps.join(', ')}
Domains: ${report.topActivities.domains.join(', ')}

CONCLUSION:
${report.conclusion}

DISCLAIMER:
${report.disclaimer}
            `;
            navigator.clipboard.writeText(text);
            alert('Report copied to clipboard!');
        }
    };

    return (
        <div className="modal-overlay open" style={{ zIndex: 9999 }}>
            <div className="modal-content open" style={{ width: '90%', maxWidth: '700px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="modal-header" style={{ background: 'linear-gradient(to right, #f3e8ff, #ffffff)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#7c3aed', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>AI Copilot</h2>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Generate Executive Reports & Incident Notes</p>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#f9fafb' }}>
                    {!report ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                {[
                                    { id: 'EXECUTIVE', label: 'Executive Summary', desc: 'High-level KPI overview, neutral tone.' },
                                    { id: 'MANAGER', label: 'Manager Report', desc: 'Productivity focus with actionable advice.' },
                                    { id: 'COMPLIANCE', label: 'Compliance Note', desc: 'Risk events only, strict factual log.' }
                                ].map((t: any) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setReportType(t.id)}
                                        style={{
                                            padding: '1rem', borderRadius: 'var(--radius-lg)', textAlign: 'left',
                                            border: reportType === t.id ? '2px solid #a855f7' : '1px solid #e5e7eb',
                                            background: reportType === t.id ? '#f3e8ff' : '#ffffff',
                                            transition: 'all 0.2s', cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#111827' }}>{t.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.2 }}>{t.desc}</div>
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    style={{
                                        background: '#7c3aed', color: 'white', padding: '0.75rem 2rem', borderRadius: '999px',
                                        fontWeight: 'bold', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        boxShadow: '0 4px 6px rgba(124, 58, 237, 0.3)', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Analyzing Telemetry...' : `Generate ${reportType} Report`}
                                    {!loading && <Bot size={18} />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#374151' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                                    {reportType === 'EXECUTIVE' ? 'Executive Briefing' :
                                        reportType === 'MANAGER' ? 'Productivity & Risk Report' : 'Incident Compliance Log'}
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', marginBottom: '1rem' }}>Generated for {report.target.name} • {new Date(report.generatedAt).toLocaleString()}</p>

                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6', marginBottom: '1rem', fontStyle: 'italic', color: '#4b5563' }}>
                                    "{report.summary}"
                                </div>

                                <h4 style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Key Insights</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                                    {report.keyInsights.length > 0 ? report.keyInsights.map(i => (
                                        <li key={i.id} style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                            <span style={{
                                                fontWeight: 'bold', padding: '0 0.4rem', borderRadius: '4px', fontSize: '0.75rem',
                                                background: i.severity === 'P1' ? '#fee2e2' : '#ffedd5',
                                                color: i.severity === 'P1' ? '#b91c1c' : '#c2410c'
                                            }}>{i.severity}</span>
                                            <span style={{ color: '#1f2937' }}><strong>{i.title}:</strong> {i.evidenceSummary}</span>
                                        </li>
                                    )) : <li style={{ color: '#9ca3af', fontStyle: 'italic' }}>No major events requested.</li>}
                                </ul>

                                <h4 style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Conclusion</h4>
                                <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.9rem' }}>{report.conclusion}</p>

                                <p style={{ fontSize: '0.625rem', color: '#9ca3af', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>{report.disclaimer}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {report && (
                    <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#fff', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                        <button onClick={() => setReport(null)} className="btn-text">
                            Reset
                        </button>
                        <button onClick={handleCopy} className="btn-primary" style={{ background: '#111827' }}>
                            <Copy size={16} /> Copy Text
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
