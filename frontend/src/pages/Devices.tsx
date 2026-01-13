import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Device, TelemetryEvent } from '../types';
import { Modal } from '../components/Modal';
import { Monitor, Edit2, Trash2, Plus, Wifi, WifiOff, AlertTriangle, Activity } from 'lucide-react';

const Devices: React.FC = () => {
    const api = useApi();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTelemetryModal, setShowTelemetryModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ONLINE': return <Wifi size={14} />;
            case 'OFFLINE': return <WifiOff size={14} />;
            case 'ERROR': return <AlertTriangle size={14} />;
            default: return <WifiOff size={14} />;
        }
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

    const handleTelemetryClick = async (device: Device) => {
        setSelectedDevice(device);
        setShowTelemetryModal(true);
        setTelemetry([]); // clear previous
        try {
            const events = await api.getDeviceTelemetry(device.deviceId);
            setTelemetry(events);
        } catch (e) {
            console.error(e);
            alert('Failed to load telemetry');
        }
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
                const payload = {
                    ...formData,
                    groupId: formData.groupId || undefined
                };
                await api.updateDevice(editingDevice.deviceId, payload);
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
                    <div style={{ color: 'var(--text-muted)', marginTop: -4 }}>Monitor device health and assignments.</div>
                </div>
                <div className="flex-row gap-md">
                    <button className="btn-primary" onClick={() => alert('Device registration is handled via Agent/CLI for now.')}>
                        <Plus size={18} />
                        Register Device
                    </button>
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
                            <tr key={dev.deviceId}>
                                <td>
                                    <div className="flex-row gap-sm">
                                        <div style={{ padding: 8, background: '#f1f5f9', borderRadius: 8, color: '#475569' }}>
                                            <Monitor size={16} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{dev.name}</span>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-light)' }}>{dev.deviceId}</td>
                                <td>
                                    <span className={`badge badge-${getStatusColor(dev.status)}`}>
                                        {getStatusIcon(dev.status)}
                                        {dev.status}
                                    </span>
                                </td>
                                <td>{dev.version}</td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    {new Date(dev.lastSeenAt).toLocaleString()}
                                </td>
                                <td>
                                    <div className="flex-row">
                                        <button className="btn-icon" onClick={() => handleEditClick(dev)} title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleTelemetryClick(dev)} title="View Telemetry">
                                            <Activity size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDeleteClick(dev.deviceId)} title="Delete" style={{ color: 'var(--danger)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Edit Device"
                size="md"
            >
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
                            placeholder="e.g. group-123"
                        />
                    </div>
                    <div className="flex-row space-between" style={{ marginTop: 32 }}>
                        <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showTelemetryModal}
                onClose={() => setShowTelemetryModal(false)}
                title={`Telemetry: ${selectedDevice?.name || 'Device'}`}
                size="lg"
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: 8 }}>Timestamp</th>
                                <th style={{ padding: 8 }}>Focus Score</th>
                                <th style={{ padding: 8 }}>Away (s)</th>
                                <th style={{ padding: 8 }}>Idle (s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {telemetry.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#888' }}>No telemetry data found.</td></tr>
                            ) : (
                                telemetry.map(t => (
                                    <tr key={t.eventId} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: 8 }}>{new Date(t.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: 8, fontWeight: 'bold', color: t.focusScore > 0.7 ? 'green' : (t.focusScore > 0.4 ? 'orange' : 'red') }}>
                                            {typeof t.focusScore === 'number' ? (t.focusScore * 100).toFixed(0) : 0}%
                                        </td>
                                        <td style={{ padding: 8 }}>{t.awaySeconds}</td>
                                        <td style={{ padding: 8 }}>{t.idleSeconds}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};

export default Devices;
