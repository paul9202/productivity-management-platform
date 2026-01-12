import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { Department } from '../types';

const Departments: React.FC = () => {
    const api = useApi();
    const [depts, setDepts] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.listDepartments().then(res => {
            setDepts(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <h1>Departments</h1>
            <div className="card">
                <table>
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
                            <tr key={d.id}>
                                <td style={{ fontWeight: 500 }}>{d.name}</td>
                                <td>{d.managerName}</td>
                                <td>{d.memberCount}</td>
                                <td>
                                    <button>View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Departments;
