import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            {/* Sidebar */}
            <aside style={{
                width: 260,
                backgroundColor: 'var(--bg-sidebar)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: 0,
                height: '100vh',
                borderRight: '1px solid #1e293b'
            }}>
                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: 8 }}></div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Focus<span style={{ color: '#a855f7' }}>OS</span></div>
                </div>

                <nav style={{ flex: 1, padding: '0 12px', marginTop: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, paddingLeft: 12 }}>Platform</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {['Dashboard', 'Employees', 'Departments', 'Alerts', 'Policies'].map(item => (
                            <li key={item}>
                                <NavLink
                                    to={item === 'Dashboard' ? '/' : `/${item.toLowerCase()}`}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                >
                                    {item}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ padding: 24, borderTop: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>AD</div>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Admin User</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Enterprise Plan</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header - now transparent/minimal or white */}
                <header style={{
                    height: 'var(--header-height)',
                    backgroundColor: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                    padding: '0 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    {/* Breadcrumbs or Title could go here */}
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overview / Dashboard</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className="btn-text">Feedback</button>
                        <button className="btn-text">Support</button>
                        <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-subtle)' }}></div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>v2.0</div>
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
