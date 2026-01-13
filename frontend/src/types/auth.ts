export interface LoginRequest {
    email?: string;
    username?: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'ORG_ADMIN';
    tenantId: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface LoginResponse {
    token: string;
    user: User;
}
