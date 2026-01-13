import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Policy, PolicyVersion } from '../types';
import { Shield, Plus, Edit2, CheckCircle, ArrowLeft, Trash2 } from 'lucide-react';
import PolicyEditor from '../components/PolicyEditor';
import { Modal } from '../components/Modal';

const Policies: React.FC = () => {
    const api = useApi();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPolicyData, setNewPolicyData] = useState({ name: '', description: '' });

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [draftVersion, setDraftVersion] = useState<PolicyVersion | undefined>(undefined);

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        setLoading(true);
        try {
            const data = await api.listPolicies();
            setPolicies(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setNewPolicyData({ name: '', description: '' });
        setShowCreateModal(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await api.createPolicy({ ...newPolicyData, organizationId: '10000000-0000-0000-0000-000000000001' });
            setShowCreateModal(false);
            loadPolicies();
            // Optional: Auto-open editor
            handleEditClick(created);
        } catch (err) {
            alert('Failed to create policy');
        }
    };

    const handleEditClick = async (policy: Policy) => {
        setLoading(true);
        try {
            let version: PolicyVersion | undefined;
            if (policy.activeVersionId) {
                const versions = await api.listPolicyVersions(policy.id);
                // Find active or just take most recent? Let's take most recent for editing
                if (versions.length > 0) {
                    version = versions[0];
                }
            }
            setSelectedPolicy(policy);
            setDraftVersion(version);
            setIsEditing(true);
        } catch (e) {
            console.error(e);
            alert('Failed to load policy details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this policy?')) return;
        try {
            await api.deletePolicy(id);
            loadPolicies();
        } catch (err) {
            console.error(err);
            alert('Failed to delete policy');
        }
    };

    const handleEditorSave = () => {
        setIsEditing(false);
        setSelectedPolicy(null);
        setDraftVersion(undefined);
        loadPolicies();
    };

    const handleEditorCancel = () => {
        setIsEditing(false);
        setSelectedPolicy(null);
        setDraftVersion(undefined);
    };

    if (loading && !isEditing) return <div className="page-container">Loading...</div>;

    if (isEditing && selectedPolicy) {
        return (
            <div className="page-container">
                <button className="btn-text" onClick={handleEditorCancel} style={{ marginBottom: 16 }}>
                    <ArrowLeft size={16} /> Back to Policies
                </button>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <PolicyEditor
                        policy={selectedPolicy}
                        initialVersion={draftVersion}
                        onSave={handleEditorSave}
                        onCancel={handleEditorCancel}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="flex-row space-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1>Policy Center</h1>
                    <div style={{ color: 'var(--text-muted)', marginTop: -4 }}>Manage security and productivity policies.</div>
                </div>
                <button className="btn-primary" onClick={handleCreateClick}>
                    <Plus size={18} />
                    Create Policy
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th>Policy Name</th>
                            <th>Description</th>
                            <th>Active Version</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {policies.map(policy => (
                            <tr key={policy.id}>
                                <td>
                                    <div className="flex-row gap-sm">
                                        <div style={{ padding: 8, background: '#f0fdf4', borderRadius: 8, color: '#16a34a' }}>
                                            <Shield size={16} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{policy.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{policy.description}</td>
                                <td>
                                    {policy.activeVersionId ? (
                                        <span className="badge badge-success">
                                            <CheckCircle size={12} />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="badge badge-neutral">Draft</span>
                                    )}
                                </td>
                                <td>{new Date(policy.updatedAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn-text" onClick={() => handleEditClick(policy)}>
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button className="btn-text danger" onClick={() => handleDelete(policy.id)}>
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Policy"
                size="md"
            >
                <form onSubmit={handleCreateSubmit}>
                    <div className="form-group">
                        <label>Policy Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={newPolicyData.name}
                            onChange={e => setNewPolicyData({ ...newPolicyData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="input-field"
                            value={newPolicyData.description}
                            onChange={e => setNewPolicyData({ ...newPolicyData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div className="flex-row space-between" style={{ marginTop: 32 }}>
                        <button type="button" className="btn-text" onClick={() => setShowCreateModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">Create Policy</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Policies;
