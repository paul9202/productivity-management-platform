import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { DeviceGroup } from '../types';

const DeviceGroups: React.FC = () => {
    const api = useApi();
    const [groups, setGroups] = useState<DeviceGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = () => {
        setLoading(true);
        api.listDeviceGroups().then(res => {
            setGroups(res);
            setLoading(false);
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createDeviceGroup({ name: newGroupName, description: newGroupDesc });
            setShowCreateModal(false);
            setNewGroupName('');
            setNewGroupDesc('');
            loadGroups();
        } catch (err) {
            console.error(err);
            alert('Failed to create group');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="flex-row space-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1>Device Groups</h1>
                    <div style={{ color: 'var(--text-muted)', marginTop: -16 }}>Manage device configurations and assignments.</div>
                </div>
                <div className="flex-row gap-md">
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>Create Group</button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th>Group Name</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map(group => (
                            <tr key={group.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ fontWeight: 500 }}>{group.name}</td>
                                <td>{group.description}</td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    {new Date(group.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <button className="btn-text">Edit</button>
                                </td>
                            </tr>
                        ))}
                        {groups.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                    No device groups found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Create Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card" style={{ width: 400 }}>
                        <h2 style={{ marginTop: 0 }}>Create Device Group</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="input-field"
                                    value={newGroupDesc}
                                    onChange={e => setNewGroupDesc(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="flex-row space-between" style={{ marginTop: 24 }}>
                                <button type="button" className="btn-text" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceGroups;
