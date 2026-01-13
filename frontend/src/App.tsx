import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceGroups from './pages/DeviceGroups';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Alerts from './pages/Alerts';
import Policies from './pages/Policies';
import Enrollment from './pages/Enrollment';
import TelemetryDetails from './pages/TelemetryDetails';
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

                        {/* Shared Routes (Employee+) */}
                        <Route element={<RequireAuth allowedRoles={['ADMIN', 'MANAGER', 'EMPLOYEE']} />}>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="alerts" element={<Alerts />} />
                                <Route path="devices" element={<Devices />} />
                                <Route path="device-groups" element={<DeviceGroups />} />
                            </Route>
                        </Route>

                        {/* Manager Routes */}
                        <Route element={<RequireAuth allowedRoles={['ADMIN', 'MANAGER']} />}>
                            <Route path="/" element={<Layout />}>
                                <Route path="employees" element={<Employees />} />
                                <Route path="departments" element={<Departments />} />
                            </Route>
                        </Route>

                        {/* Admin Only Routes */}
                        <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
                            <Route path="/" element={<Layout />}>
                                <Route path="policies" element={<Policies />} />
                                <Route path="enrollment" element={<Enrollment />} />
                                <Route path="devices/:deviceId/telemetry" element={<TelemetryDetails />} />
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
