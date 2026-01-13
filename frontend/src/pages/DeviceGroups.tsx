import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { DeviceGroup } from '../types';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';

const DeviceGroups: React.FC = () => {
    const api = useApi();
    const [groups, setGroups] = useState<DeviceGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [editingGroup, setEditingGroup] = useState<DeviceGroup | null>(null);

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

    const handleCreateClick = () => {
        setEditingGroup(null);
        setNewGroupName('');
        setNewGroupDesc('');
        setShowModal(true);
    };

    const handleEditClick = (group: DeviceGroup) => {
        setEditingGroup(group);
        setNewGroupName(group.name);
        setNewGroupDesc(group.description || '');
        setShowModal(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await api.deleteDeviceGroup(id);
                loadGroups();
            } catch (err) {
                console.error(err);
                alert('Failed to delete group');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingGroup) {
                await api.updateDeviceGroup(editingGroup.id, { name: newGroupName, description: newGroupDesc });
            } else {
                await api.createDeviceGroup({ name: newGroupName, description: newGroupDesc });
            }
            setShowModal(false);
            setEditingGroup(null);
            setNewGroupName('');
            setNewGroupDesc('');
            loadGroups();
        } catch (err) {
            console.error(err);
            alert('Failed to save group');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="flex-row space-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1>Device Groups</h1>
                    <div style={{ color: 'var(--text-muted)', marginTop: -4 }}>Manage device configurations and assignments.</div>
                </div>
                <button className="btn-primary" onClick={handleCreateClick}>
                    <Plus size={18} />
                    Create Group
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th>Group Name</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th style={{ width: 100 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map(group => (
                            <tr key={group.id}>
                                <td>
                                    <div className="flex-row gap-sm">
                                        <div style={{ padding: 8, background: '#f1f5f9', borderRadius: 8, color: '#475569' }}>
                                            <Layers size={16} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{group.name}</span>
                                    </div>
                                </td>
                                <td>{group.description}</td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    {new Date(group.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <div className="flex-row">
                                        <button className="btn-icon" onClick={() => handleEditClick(group)} title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDeleteClick(group.id)} title="Delete" style={{ color: 'var(--danger)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
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

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingGroup ? 'Edit Device Group' : 'Create Device Group'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="e.g. Engineering Laptops"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="input-field"
                            value={newGroupDesc}
                            onChange={e => setNewGroupDesc(e.target.value)}
                            placeholder="Optional description..."
                            rows={3}
                        />
                    </div>
                    <div className="flex-row space-between" style={{ marginTop: 32 }}>
                        <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            {editingGroup ? 'Save Changes' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DeviceGroups;
