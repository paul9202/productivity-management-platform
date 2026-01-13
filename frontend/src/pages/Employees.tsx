import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Employee } from '../types';
import { Modal } from '../components/Modal';
import { Mail, Edit2, Trash2, Plus, Search } from 'lucide-react';

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
                    <div style={{ color: 'var(--text-muted)', marginTop: -4 }}>Manage employee access and view individual metrics.</div>
                </div>
                <div className="flex-row gap-md">
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="input-field"
                            style={{ paddingLeft: 36, width: 250 }}
                        />
                    </div>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <Plus size={18} />
                        Add Employee
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Role / Title</th>
                            <th>Status</th>
                            <th>Email Address</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {emp.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{emp.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>{emp.role}</span>
                                </td>
                                <td>
                                    <span className={`badge badge-${emp.status?.toLowerCase() === 'active' ? 'success' : 'neutral'}`}>
                                        {emp.status || 'UNKNOWN'}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    <div className="flex-row gap-sm">
                                        <Mail size={14} />
                                        {emp.email}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="flex-row" style={{ justifyContent: 'flex-end' }}>
                                        <button className="btn-icon" onClick={() => handleEditClick(emp)} title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDeleteClick(emp.id)} title="Remove" style={{ color: 'var(--danger)' }}>
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
                title={editingEmp ? 'Edit Employee' : 'Add Employee'}
                size="md"
            >
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
                    <div className="flex-row space-between" style={{ marginTop: 32 }}>
                        <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            {editingEmp ? 'Save Changes' : 'Create Employee'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Employees;
