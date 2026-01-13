import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Alerts from './pages/Alerts';
import Policies from './pages/Policies';
import Login from './pages/Login';
import { ApiProvider } from './api';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';

const App: React.FC = () => {
    return (
        <ApiProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route element={<RequireAuth />}>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="employees" element={<Employees />} />
                                <Route path="departments" element={<Departments />} />
                                <Route path="alerts" element={<Alerts />} />
                                <Route path="policies" element={<Policies />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ApiProvider>
    );
};

export default App;
