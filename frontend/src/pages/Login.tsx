import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
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
            <div className="card" style={{ width: 400, padding: 40 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: 12, margin: '0 auto 16px' }}></div>
                    <h2>Welcome Back</h2>
                    <div style={{ color: 'var(--text-muted)' }}>Sign in to FocusOS Admin</div>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', fontWeight: 500 }}>Username</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="password"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}
                        />
                    </div>

                    {error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
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
