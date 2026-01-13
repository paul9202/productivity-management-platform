import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Department } from '../types';

const Departments: React.FC = () => {
    const api = useApi();
    const [depts, setDepts] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: '', managerId: '' }); // Removed 'man-1' default which caused backend error

    useEffect(() => {
        loadDepts();
    }, []);

    const loadDepts = () => {
        setLoading(true);
        api.listDepartments().then(res => {
            setDepts(res);
            setLoading(false);
        });
    };

    const handleCreateClick = () => {
        setEditingDept(null);
        setFormData({ name: '', managerId: '' });
        setShowModal(true);
    };

    const handleEditClick = (dept: Department) => {
        setEditingDept(dept);
        setFormData({ name: dept.name, managerId: dept.managerId });
        setShowModal(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await api.deleteDepartment(id);
                loadDepts();
            } catch (err) {
                console.error(err);
                alert('Failed to delete department');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingDept) {
                await api.updateDepartment(editingDept.id, formData);
            } else {
                const payload = {
                    ...formData,
                    managerId: formData.managerId || null // Ensure null if empty string
                };
                await api.createDepartment(payload);
            }
            setShowModal(false);
            loadDepts();
        } catch (err) {
            console.error(err);
            alert('Failed to save department');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <div className="flex-row space-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1>Departments</h1>
                    <div style={{ color: 'var(--text-muted)', marginTop: -16 }}>Manage organization structure.</div>
                </div>
                <button className="btn-primary" onClick={handleCreateClick}>Add Department</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Manager</th>
                            <th>Members</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {depts.map(d => (
                            <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ fontWeight: 500 }}>{d.name}</td>
                                <td>{d.managerName || 'Unassigned'}</td>
                                <td>{d.memberCount || 0}</td>
                                <td>
                                    <div className="flex-row gap-sm">
                                        <button className="btn-text" onClick={() => handleEditClick(d)}>Edit</button>
                                        <button className="btn-text" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteClick(d.id)}>Delete</button>
                                    </div>
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
                        <h2 style={{ marginTop: 0 }}>{editingDept ? 'Edit Department' : 'New Department'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Department Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Manager ID (Mock)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.managerId}
                                    onChange={e => setFormData({ ...formData, managerId: e.target.value })}
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

export default Departments;
