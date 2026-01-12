import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Alerts from './pages/Alerts';
import Policies from './pages/Policies';
import { ApiProvider } from './api';

const App: React.FC = () => {
    return (
        <ApiProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="departments" element={<Departments />} />
                        <Route path="alerts" element={<Alerts />} />
                        <Route path="policies" element={<Policies />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ApiProvider>
    );
};

export default App;
