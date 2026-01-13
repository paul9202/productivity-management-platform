import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Device } from '../types';

const Devices: React.FC = () => {
    const api = useApi();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [formData, setFormData] = useState({ name: '', groupId: '' });

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = () => {
        setLoading(true);
        api.listDevices().then(res => {
            setDevices(res);
            setLoading(false);
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ONLINE': return 'success';
            case 'OFFLINE': return 'neutral';
            case 'ERROR': return 'danger';
            default: return 'neutral';
        }
    };

    const handleEditClick = (device: Device) => {
        setEditingDevice(device);
        setFormData({ name: device.name, groupId: device.groupId || '' });
        setShowModal(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this device?')) {
            try {
                await api.deleteDevice(id);
                loadDevices();
            } catch (err) {
                console.error(err);
                alert('Failed to delete device');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingDevice) {
                await api.updateDevice(editingDevice.id, formData);
            }
            setShowModal(false);
            loadDevices();
        } catch (err) {
            console.error(err);
            alert('Failed to save device');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="flex-row space-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1>Device Inventory</h1>
                    <div style={{ color: 'var(--text-muted)', marginTop: -16 }}>Monitor device health and assignments.</div>
                </div>
                <div className="flex-row gap-md">
                    <button className="btn-primary" onClick={() => alert('Device registration is handled via Agent/CLI for now.')}>Register Device</button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Version</th>
                            <th>Last Seen</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map(dev => (
                            <tr key={dev.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ fontWeight: 500 }}>{dev.name}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{dev.id}</td>
                                <td>
                                    <span className={`badge badge-${getStatusColor(dev.status)}`}>
                                        {dev.status}
                                    </span>
                                </td>
                                <td>{dev.version}</td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    {new Date(dev.lastSeenAt).toLocaleString()}
                                </td>
                                <td>
                                    <button className="btn-text" onClick={() => handleEditClick(dev)}>Edit</button>
                                    <button className="btn-text" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteClick(dev.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card" style={{ width: 400 }}>
                        <h2 style={{ marginTop: 0 }}>Edit Device</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Device Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Group ID</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.groupId}
                                    onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                                />
                            </div>
                            <div className="flex-row space-between" style={{ marginTop: 24 }}>
                                <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Devices;
