import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './common/LanguageSwitcher';
import { ThemeSwitcher } from './common/ThemeSwitcher';
import { Logo } from './common/Logo';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const hasRole = (roles: string[]) => user && roles.includes(user.role);

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
                borderRight: '1px solid var(--border)'
            }}>
                <div style={{ padding: '24px' }}>
                    <Logo />
                </div>

                <nav style={{ flex: 1, padding: '0 12px', marginTop: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, paddingLeft: 12 }}>{t('app.description')}</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li key="Dashboard">
                            <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{t('nav.dashboard')}</NavLink>
                        </li>

                        <li key="Devices">
                            <NavLink to="/devices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{t('nav.devices')}</NavLink>
                        </li>
                        <li key="DeviceGroups">
                            <NavLink to="/device-groups" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{t('nav.devices')} (Groups)</NavLink>
                        </li>

                        {(hasRole(['ADMIN', 'MANAGER'])) && (
                            <>
                                <li key="Employees">
                                    <NavLink to="/employees" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Employees</NavLink>
                                </li>
                                <li key="Departments">
                                    <NavLink to="/departments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Departments</NavLink>
                                </li>
                            </>
                        )}

                        <li key="Alerts">
                            <NavLink to="/alerts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Alerts</NavLink>
                        </li>

                        {(hasRole(['ADMIN'])) && (
                            <>
                                <li key="Policies">
                                    <NavLink to="/policies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{t('nav.policies')}</NavLink>
                                </li>
                                <li key="Enrollment">
                                    <NavLink to="/enrollment" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{t('nav.enrollment')}</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user?.role}</div>
                        </div>
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title={t('header.logout')}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
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
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('nav.dashboard')} / Overview</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <LanguageSwitcher />
                        <ThemeSwitcher />
                        <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-subtle)' }}></div>
                        <button className="btn-text">Feedback</button>
                        <button className="btn-text">Support</button>
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
