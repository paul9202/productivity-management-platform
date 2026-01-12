import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Employee } from '../types';

const Employees: React.FC = () => {
    const api = useApi();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.listEmployees().then(res => {
            setEmployees(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="flex-row space-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1>Directory</h1>
                    <div style={{ color: 'var(--text-muted)', marginTop: -16 }}>Manage employee access and view individual metrics.</div>
                </div>
                <div className="flex-row gap-md">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        style={{ padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', minWidth: 250 }}
                    />
                    <button className="btn-primary">Add Employee</button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Role / Title</th>
                            <th>Current Status</th>
                            <th>Email Address</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {emp.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{emp.name}</span>
                                    </div>
                                </td>
                                <td>{emp.role}</td>
                                <td>
                                    <span className={`badge badge-${emp.status.toLowerCase()}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="btn-text" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Employees;
