import React, { useState } from 'react';
import { Bot, Copy, Download, X } from 'lucide-react';
import { convertToMarkdown } from '../../utils/exportUtils'; // Placeholder or inline
import { ExecutiveReport } from '../../types/telemetry';

// Simple types for props since we generate content outside
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-600 p-2 rounded-xl text-white shadow-lg shadow-purple-200">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Copilot</h2>
                            <p className="text-sm text-gray-500">Generate Executive Reports & Incident Notes</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                    {!report ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'EXECUTIVE', label: 'Executive Summary', desc: 'High-level KPI overview, neutral tone.' },
                                    { id: 'MANAGER', label: 'Manager Report', desc: 'Productivity focus with actionable advice.' },
                                    { id: 'COMPLIANCE', label: 'Compliance Note', desc: 'Risk events only, strict factual log.' }
                                ].map((t: any) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setReportType(t.id)}
                                        className={`p-4 rounded-xl border text-left transition-all hover:shadow-md
                                            ${reportType === t.id ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="font-bold text-sm mb-1 text-gray-900">{t.label}</div>
                                        <div className="text-xs text-gray-500 leading-tight">{t.desc}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center py-8">
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {loading ? 'Analyzing Telemetry...' : `Generate ${reportType} Report`}
                                    {!loading && <Bot size={18} />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="prose prose-sm max-w-none">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    {reportType === 'EXECUTIVE' ? 'Executive Briefing' :
                                        reportType === 'MANAGER' ? 'Productivity & Risk Report' : 'Incident Compliance Log'}
                                </h3>
                                <p className="text-xs text-gray-400 font-mono mb-4">Generated for {report.target.name} • {new Date(report.generatedAt).toLocaleString()}</p>

                                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 mb-4 text-gray-700 italic">
                                    "{report.summary}"
                                </div>

                                <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-2">Key Insights</h4>
                                <ul className="space-y-2 mb-4">
                                    {report.keyInsights.length > 0 ? report.keyInsights.map(i => (
                                        <li key={i.id} className="text-sm flex gap-2">
                                            <span className={`font-bold px-1.5 rounded text-xs h-fit ${i.severity === 'P1' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{i.severity}</span>
                                            <span className="text-gray-800">{i.title}: {i.evidenceSummary}</span>
                                        </li>
                                    )) : <li className="text-gray-400 italic">No major events requested.</li>}
                                </ul>

                                <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-2">Conclusion</h4>
                                <p className="text-sm font-bold text-gray-900">{report.conclusion}</p>

                                <p className="text-[10px] text-gray-400 mt-6 pt-4 border-t border-gray-100">{report.disclaimer}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {report && (
                    <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                        <button onClick={() => setReport(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium">
                            Reset
                        </button>
                        <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium">
                            <Copy size={16} /> Copy Text
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
