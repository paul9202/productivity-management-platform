import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ width: 250, backgroundColor: 'var(--sidebar-bg)', color: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 20, fontSize: '1.25rem', fontWeight: 'bold' }}>Productivity-X</div>
                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {['Dashboard', 'Employees', 'Departments', 'Alerts', 'Policies'].map(item => (
                            <li key={item}>
                                <NavLink
                                    to={item === 'Dashboard' ? '/' : `/${item.toLowerCase()}`}
                                    style={({ isActive }) => ({
                                        display: 'block',
                                        padding: '12px 20px',
                                        color: isActive ? 'white' : '#a8a8a8',
                                        textDecoration: 'none',
                                        backgroundColor: isActive ? '#353535' : 'transparent',
                                        borderLeft: isActive ? '4px solid var(--primary-color)' : '4px solid transparent'
                                    })}
                                >
                                    {item}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div style={{ padding: 20, fontSize: '0.75rem', color: '#666' }}>v1.0.0 (Offline Mode)</div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{ height: 60, backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>Enterprise Admin Portal</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#eee' }}></div>
                        <span>Admin User</span>
                    </div>
                </header>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
