import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Device } from '../types';

const Devices: React.FC = () => {
    const api = useApi();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.listDevices().then(res => {
            setDevices(res);
            setLoading(false);
        });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ONLINE': return 'success';
            case 'OFFLINE': return 'neutral';
            case 'ERROR': return 'danger';
            default: return 'neutral';
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
                    <button className="btn-primary">Register Device</button>
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
                                    <button className="btn-text">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Devices;
