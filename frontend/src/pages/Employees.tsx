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
            <div className="flex-row space-between" style={{ marginBottom: 24 }}>
                <h1>Employee Directory</h1>
                <button style={{ padding: '8px 16px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 4 }}>Add Employee</button>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td style={{ fontWeight: 500 }}>{emp.name}</td>
                                <td>{emp.role}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: 12,
                                        fontSize: '0.75rem',
                                        backgroundColor: emp.status === 'ACTIVE' ? '#defbe6' : emp.status === 'IDLE' ? '#fcf4db' : '#f2f4f8',
                                        color: emp.status === 'ACTIVE' ? '#198038' : emp.status === 'IDLE' ? '#f1c21b' : '#697077'
                                    }}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td>{emp.email}</td>
                                <td>
                                    <button style={{ marginRight: 8 }}>View</button>
                                    <button>Edit</button>
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
