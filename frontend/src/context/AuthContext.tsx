import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, LoginResponse, User } from '../types/auth';

interface AuthContextType extends AuthState {
    login: (data: LoginResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'focus_os_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
    });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setState({ ...parsed, isAuthenticated: true });
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const login = (data: LoginResponse) => {
        const newState = { user: data.user, token: data.token, isAuthenticated: true };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    };

    const logout = () => {
        setState({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
