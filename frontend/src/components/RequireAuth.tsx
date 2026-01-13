import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
    allowedRoles?: string[];
}

const RequireAuth: React.FC<Props> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <div className="page-container"><h2>403 Forbidden</h2><p>You do not have access to this page.</p></div>;
    }

    return <Outlet />;
};

export default RequireAuth;
