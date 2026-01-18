import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../api';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui';

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
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>

            <Card className="w-full max-w-md shadow-lg border-0 sm:border">
                <CardHeader className="space-y-4 flex flex-col items-center justify-center pt-10">
                    <Logo size={48} showText={true} />
                    <CardTitle className="text-xl font-medium text-slate-600 dark:text-slate-400">
                        {t('pages.login.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('pages.login.email_label')}
                            </label>
                            <Input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="admin"
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('pages.login.password_label')}
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="password"
                                required
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-900">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                            {loading ? '...' : t('pages.login.submit')}
                        </Button>

                        <div className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
                            Demo Credentials:<br />
                            User: <span className="font-mono font-medium">admin</span> | Pass: <span className="font-mono font-medium">password</span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
