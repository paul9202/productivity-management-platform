import React, { useState, useEffect } from 'react';
import { Policy, PolicyVersion } from '../types';
import { Save, RotateCcw, Shield, Eye, Bell } from 'lucide-react';
import { useApi } from '../api';

interface PolicyEditorProps {
    policy: Policy;
    initialVersion?: PolicyVersion;
    onSave: () => void;
    onCancel: () => void;
}

const PolicyEditor: React.FC<PolicyEditorProps> = ({ policy, initialVersion, onSave, onCancel }) => {
    const api = useApi();
    const [activeTab, setActiveTab] = useState<'general' | 'blocking' | 'alerts'>('general');
    const [config, setConfig] = useState<any>({
        idleTimeoutMinutes: 15,
        workHours: { start: '09:00', end: '17:00' },
        blockedSites: [],
        blockedApps: [],
        alertSensitivity: 'medium'
    });

    useEffect(() => {
        if (initialVersion && initialVersion.configuration) {
            try {
                setConfig(JSON.parse(initialVersion.configuration));
            } catch (e) {
                console.error("Failed to parse config", e);
            }
        }
    }, [initialVersion]);

    const handleSave = async (publish: boolean) => {
        try {
            const version = await api.createPolicyVersion(policy.id, {
                configuration: JSON.stringify(config)
            });

            if (publish) {
                await api.publishPolicyVersion(policy.id, version.id);
            }
            onSave();
        } catch (err) {
            alert('Failed to save policy version');
        }
    };

    return (
        <div className="policy-editor">
            <div className="editor-header flex-row space-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Editing: {policy.name}</h2>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {initialVersion ? `Based on Version ${initialVersion.version}` : 'New Draft'}
                    </div>
                </div>
                <div className="flex-row gap-sm">
                    <button className="btn-text" onClick={onCancel}>Cancel</button>
                    <button className="btn-secondary" onClick={() => handleSave(false)}>
                        <Save size={16} /> Save Draft
                    </button>
                    <button className="btn-primary" onClick={() => handleSave(true)}>
                        <RotateCcw size={16} /> Publish
                    </button>
                </div>
            </div>

            <div className="editor-tabs flex-row" style={{ padding: '0 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                    style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
                >
                    <div className="flex-row gap-xs">
                        <Shield size={16} /> General
                    </div>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'blocking' ? 'active' : ''}`}
                    onClick={() => setActiveTab('blocking')}
                    style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'blocking' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
                >
                    <div className="flex-row gap-xs">
                        <Eye size={16} /> Blocking
                    </div>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                    style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'alerts' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
                >
                    <div className="flex-row gap-xs">
                        <Bell size={16} /> Alerts
                    </div>
                </button>
            </div>

            <div className="editor-content" style={{ padding: 24 }}>
                {activeTab === 'general' && (
                    <div className="form-section">
                        <h3>Productivity Thresholds</h3>
                        <div className="form-group">
                            <label>Idle Timeout (Minutes)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={config.idleTimeoutMinutes}
                                onChange={e => setConfig({ ...config, idleTimeoutMinutes: parseInt(e.target.value) })}
                            />
                            <div className="helper-text">Time before an employee is marked as IDLE.</div>
                        </div>
                    </div>
                )}

                {activeTab === 'blocking' && (
                    <div className="form-section">
                        <h3>Blocked Domains</h3>
                        <textarea
                            className="input-field"
                            rows={5}
                            placeholder="facebook.com, twitter.com (one per line or comma separated)"
                            value={config.blockedSites.join('\n')}
                            onChange={e => setConfig({ ...config, blockedSites: e.target.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean) })}
                        />
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="form-section">
                        <h3>Alert Sensitivity</h3>
                        <select
                            className="input-field"
                            value={config.alertSensitivity}
                            onChange={e => setConfig({ ...config, alertSensitivity: e.target.value })}
                        >
                            <option value="low">Low (Only defined blockers)</option>
                            <option value="medium">Medium (Standard productivity)</option>
                            <option value="high">High (Strict monitoring)</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyEditor;
