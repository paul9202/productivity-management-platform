import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { Logo } from '../components/common/Logo';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const api = useApi();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.login({ username, password });
            auth.login(res);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
                <LanguageSwitcher />
            </div>
            <div className="card" style={{ width: 400, padding: 40 }}>
                <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Logo size={48} showText={true} />
                    <div style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{t('pages.login.title')}</div>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', fontWeight: 500 }}>{t('pages.login.email_label')}</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', fontWeight: 500 }}>{t('pages.login.password_label')}</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="password"
                            required
                        />
                    </div>

                    {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                        {loading ? '...' : t('pages.login.submit')}
                    </button>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
                        Demo Credentials:<br />
                        User: <b>admin</b> | Pass: <b>password</b>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
