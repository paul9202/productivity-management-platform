import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { AlertEvent } from '../types';

const Alerts: React.FC = () => {
    const api = useApi();
    const [alerts, setAlerts] = useState<AlertEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.listAlerts().then(res => {
            setAlerts(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <h1>Alerts Console</h1>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Severity</th>
                            <th>Type</th>
                            <th>Employee</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map(a => (
                            <tr key={a.id}>
                                <td>
                                    <span style={{
                                        color: a.severity === 'HIGH' ? 'var(--error-color)' : a.severity === 'MEDIUM' ? 'var(--warning-color)' : 'var(--text-secondary)',
                                        fontWeight: 'bold'
                                    }}>
                                        {a.severity}
                                    </span>
                                </td>
                                <td>{a.type}</td>
                                <td>{a.employeeName}</td>
                                <td>{new Date(a.timestamp).toLocaleString()}</td>
                                <td>
                                    {a.acknowledged ?
                                        <span style={{ color: 'var(--success-color)' }}>Acknowledged</span> :
                                        <button onClick={() => alert('Mock Acknowledge')}>Acknowledge</button>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Alerts;
