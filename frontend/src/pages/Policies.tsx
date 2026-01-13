
import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Policy } from '../types';
import { Shield, Plus, Edit2, CheckCircle } from 'lucide-react';

const Policies: React.FC = () => {
    const api = useApi();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    // const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null); // TODO: for edit mode
    const [policyFormData, setPolicyFormData] = useState({ name: '', description: '' });

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
        // setSelectedPolicy(null);
        setPolicyFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createPolicy({ ...policyFormData, organizationId: 'org1' }); // Default org
            setShowModal(false);
            loadPolicies();
        } catch (err) {
            alert('Failed to create policy');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

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
                                    <button className="btn-text" onClick={() => alert('Navigate to detail view (Coming Soon)')}>
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Create New Policy"
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Policy Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={policyFormData.name}
                            onChange={e => setPolicyFormData({ ...policyFormData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="input-field"
                            value={policyFormData.description}
                            onChange={e => setPolicyFormData({ ...policyFormData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div className="flex-row space-between" style={{ marginTop: 32 }}>
                        <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">Create Policy</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Policies;
