import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Employee } from '../types';

const Employees: React.FC = () => {
    const api = useApi();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'EMPLOYEE', departmentId: '' });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        api.listEmployees().then(res => {
            setEmployees(res);
            setLoading(false);
        });
    };

    const handleCreateClick = () => {
        setEditingEmp(null);
        setFormData({ name: '', email: '', role: 'EMPLOYEE', departmentId: '' });
        setShowModal(true);
    };

    const handleEditClick = (emp: Employee) => {
        setEditingEmp(emp);
        setFormData({ name: emp.name, email: emp.email, role: emp.role || 'EMPLOYEE', departmentId: emp.departmentId || '' });
        setShowModal(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this employee?')) {
            try {
                await api.deleteEmployee(id);
                loadEmployees();
            } catch (err) {
                console.error(err);
                alert('Failed to delete employee');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingEmp) {
                await api.updateEmployee(editingEmp.id, formData);
            } else {
                await api.createEmployee(formData);
            }
            setShowModal(false);
            loadEmployees();
        } catch (err) {
            console.error(err);
            alert('Failed to save employee');
        }
    };

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
                    <button className="btn-primary" onClick={handleCreateClick}>Add Employee</button>
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
                            <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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
                                    <span className={`badge badge-${emp.status?.toLowerCase() || 'neutral'}`}>
                                        {emp.status || 'UNKNOWN'}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="btn-text" onClick={() => handleEditClick(emp)}>Edit</button>
                                    <button className="btn-text" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteClick(emp.id)}>Remove</button>
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
                        <h2 style={{ marginTop: 0 }}>{editingEmp ? 'Edit Employee' : 'Add Employee'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    className="input-field"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
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

export default Employees;
