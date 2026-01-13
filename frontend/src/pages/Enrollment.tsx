import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { EnrollmentToken, DeviceGroup } from '../types';
import { Plus, Trash2, Copy, Key, Shield } from 'lucide-react';
import { Modal } from '../components/Modal';

const Enrollment: React.FC = () => {
    const api = useApi();
    const [tokens, setTokens] = useState<EnrollmentToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groups, setGroups] = useState<DeviceGroup[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        type: 'BOOTSTRAP',
        scopeGroupId: '',
        maxUses: 100,
        expiresInDays: 30
    });

    const [createdToken, setCreatedToken] = useState<EnrollmentToken | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        // Load independent data sources
        const results = await Promise.allSettled([
            api.listEnrollmentTokens(),
            api.listDeviceGroups()
        ]);

        // Handle Tokens
        if (results[0].status === 'fulfilled') {
            setTokens(results[0].value);
        } else {
            console.error("Failed to load tokens:", results[0].reason);
        }

        // Handle Groups
        if (results[1].status === 'fulfilled') {
            setGroups(results[1].value);
        } else {
            console.error("Failed to load groups:", results[1].reason);
        }

        setLoading(false);
    };

    const handleCreate = async () => {
        try {
            const expires = new Date();
            expires.setDate(expires.getDate() + formData.expiresInDays);

            const newToken = await api.createEnrollmentToken({
                type: formData.type as 'BOOTSTRAP' | 'REGCODE',
                scopeGroupId: formData.scopeGroupId || undefined,
                maxUses: formData.type === 'REGCODE' ? 1 : formData.maxUses,
                expiresAt: expires.toISOString()
                // scopeTenantId omitted, backend will default it
            });

            setCreatedToken(newToken);
            loadData();
            // Don't close modal yet, show the token secret!
        } catch (e) {
            alert('Failed to create token');
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this token? Devices using it will fail to enroll.')) return;
        try {
            await api.revokeEnrollmentToken(id);
            loadData();
        } catch (e) {
            alert('Failed to revoke token');
        }
    };

    const copyToClipboard = (text: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Copied to clipboard!');
            }, () => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";  // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Failed to copy token manually.');
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="page-container">
            <div className="page-header flex-row space-between">
                <div>
                    <h1>Enrollment Management</h1>
                    <p className="text-muted">Manage Bootstrap Tokens and Registration Codes for device onboarding.</p>
                </div>
                <button className="btn-primary" onClick={() => { setIsModalOpen(true); setCreatedToken(null); }}>
                    <Plus size={18} /> Create Token
                </button>
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Token Hash (Partial)</th>
                                    <th>Target Group</th>
                                    <th>Uses</th>
                                    <th>Expires</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tokens.map(t => {
                                    const isExpired = new Date(t.expiresAt) < new Date();
                                    const isRevoked = !!t.revokedAt;
                                    const groupName = groups.find(g => g.id === t.scopeGroupId)?.name || 'Default';

                                    return (
                                        <tr key={t.id} style={{ opacity: isRevoked || isExpired ? 0.6 : 1 }}>
                                            <td>
                                                <div className="flex-row gap-xs">
                                                    {t.type === 'BOOTSTRAP' ? <Shield size={16} /> : <Key size={16} />}
                                                    {t.type}
                                                </div>
                                            </td>
                                            <td className="font-mono">{t.tokenHash?.substring(0, 8)}...</td>
                                            <td>{groupName}</td>
                                            <td>{t.usedCount} / {t.maxUses === 9999 ? '∞' : t.maxUses}</td>
                                            <td>{new Date(t.expiresAt).toLocaleDateString()}</td>
                                            <td>
                                                {isRevoked ? <span className="badge badge-error">REVOKED</span> :
                                                    isExpired ? <span className="badge badge-warning">EXPIRED</span> :
                                                        <span className="badge badge-success">ACTIVE</span>}
                                            </td>
                                            <td>
                                                {!isRevoked && !isExpired && (
                                                    <button className="btn-icon danger" onClick={() => handleRevoke(t.id)} title="Revoke">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={createdToken ? "Token Created Successfully" : "Create Enrollment Token"}
                footer={
                    createdToken ? (
                        <button className="btn-primary" onClick={() => setIsModalOpen(false)}>Done</button>
                    ) : (
                        <div className="flex-row gap-sm justify-end" style={{ width: '100%' }}>
                            <button className="btn-text" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreate}>Generate</button>
                        </div>
                    )
                }
            >
                {createdToken ? (
                    <div className="text-center">
                        <div className="alert-box success" style={{ marginBottom: 16 }}>
                            <p><strong>Save this token now!</strong> It will not be shown again.</p>
                        </div>
                        <div className="code-block flex-row space-between" style={{ padding: 12, background: '#111', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                            <code style={{ color: '#0f0', fontSize: '1.2em' }}>{createdToken.token}</code>
                            <button className="btn-icon" onClick={() => copyToClipboard(createdToken.token)}>
                                <Copy size={18} />
                            </button>
                        </div>
                        <p className="text-muted mt-4">
                            Type: {createdToken.type} <br />
                            Expires: {new Date(createdToken.expiresAt).toLocaleString()}
                        </p>
                    </div>
                ) : (
                    <div className="form-stack">
                        <div className="form-group">
                            <label>Token Type</label>
                            <select
                                className="input-field"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="BOOTSTRAP">Bootstrap Token (Mass Deployment)</option>
                                <option value="REGCODE">Registration Code (One-time User Entry)</option>
                            </select>
                            <div className="helper-text">
                                {formData.type === 'BOOTSTRAP' ?
                                    'Used for automated installation scripts (e.g. Intune/SCCM).' :
                                    'Short code for users to manually enter in the helper app.'}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Target Device Group</label>
                            <select
                                className="input-field"
                                value={formData.scopeGroupId}
                                onChange={e => setFormData({ ...formData, scopeGroupId: e.target.value })}
                            >
                                <option value="">Default (Unassigned)</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                                {groups.length === 0 && <option disabled>No groups available (Create in 'Groups' page)</option>}
                            </select>
                        </div>

                        {formData.type === 'BOOTSTRAP' && (
                            <div className="form-group">
                                <label>Max Uses</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={formData.maxUses}
                                    onChange={e => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Expires In (Days)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.expiresInDays}
                                onChange={e => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Enrollment;
