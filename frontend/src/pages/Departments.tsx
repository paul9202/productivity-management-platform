import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Department } from '../types';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, Users, Building2 } from 'lucide-react';

const Departments: React.FC = () => {
    const api = useApi();
    const [depts, setDepts] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: '', managerId: '' });

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
        setFormData({ name: dept.name, managerId: dept.managerId || '' });
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
                    managerId: formData.managerId || undefined
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
                    <div style={{ color: 'var(--text-muted)', marginTop: -4 }}>Manage your organization structure and teams.</div>
                </div>
                <button className="btn-primary" onClick={handleCreateClick}>
                    <Plus size={18} />
                    Add Department
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Manager</th>
                            <th>Parent Dept</th>
                            <th>Created At</th>
                            <th style={{ width: 100 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {depts.map(d => (
                            <tr key={d.id}>
                                <td>
                                    <div className="flex-row gap-sm">
                                        <div style={{ padding: 8, background: 'var(--primary-light)', borderRadius: 8, color: 'var(--primary)' }}>
                                            <Building2 size={16} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{d.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex-row gap-sm">
                                        <Users size={14} className="text-muted" />
                                        {d.managerId || <span style={{ color: 'var(--text-light)' }}>Unassigned</span>}
                                    </div>
                                </td>
                                <td>{d.parentId ? <span className="badge badge-neutral">Sub-dept</span> : <span className="badge badge-success">Root</span>}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="flex-row">
                                        <button className="btn-icon" onClick={() => handleEditClick(d)} title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDeleteClick(d.id)} title="Delete" style={{ color: 'var(--danger)' }}>
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
                title={editingDept ? 'Edit Department' : 'New Department'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Department Name</label>
                        <input
                            className="input-field"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Engineering"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Manager ID (Optional)</label>
                        <input
                            className="input-field"
                            value={formData.managerId}
                            onChange={e => setFormData({ ...formData, managerId: e.target.value })}
                            placeholder="e.g. emp-123"
                        />
                    </div>
                    <div className="flex-row space-between" style={{ marginTop: 32 }}>
                        <button type="button" className="btn-text" onClick={() => setShowModal(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            {editingDept ? 'Save Changes' : 'Create Department'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Departments;
