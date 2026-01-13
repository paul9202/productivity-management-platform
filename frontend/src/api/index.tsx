import {
    DashboardSummary, Department, Employee, AlertEvent, PolicySettings, Device
} from '../types';
import { LoginRequest, LoginResponse } from '../types/auth';
import { MOCK_ALERTS, MOCK_DASHBOARD, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_POLICY } from '../mock/mockData';
import React, { createContext, useContext } from 'react';

export interface ApiClient {
    login(req: LoginRequest): Promise<LoginResponse>;
    getDashboardSummary(): Promise<DashboardSummary>;
    listDepartments(): Promise<Department[]>;
    listEmployees(filter?: { deptId?: string }): Promise<Employee[]>;
    listAlerts(): Promise<AlertEvent[]>;
    getPolicies(): Promise<PolicySettings>;
    listDevices(): Promise<Device[]>;
}

class MockApiClient implements ApiClient {
    async listDevices(): Promise<Device[]> {
        return new Promise(resolve => setTimeout(() => resolve([
            { id: 'dev-1', name: 'Mock Device 1', status: 'ONLINE', groupId: 'g1', tenantId: 't1', version: '1.0', lastSeenAt: new Date().toISOString() },
            { id: 'dev-2', name: 'Mock Device 2', status: 'OFFLINE', groupId: 'g1', tenantId: 't1', version: '1.0', lastSeenAt: new Date().toISOString() }
        ]), 300));
    }
    async login(req: LoginRequest): Promise<LoginResponse> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (req.password === 'password') {
                    resolve({
                        token: 'mock-jwt-token',
                        user: {
                            id: 'u-admin',
                            name: 'Demo Admin',
                            email: req.username,
                            role: 'ADMIN',
                            tenantId: 't-demo'
                        }
                    });
                } else {
                    reject(new Error('Invalid credentials (try password="password")'));
                }
            }, 500);
        });
    }
    async getDashboardSummary(): Promise<DashboardSummary> {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_DASHBOARD), 300));
    }
    async listDepartments(): Promise<Department[]> {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_DEPARTMENTS), 200));
    }
    async listEmployees(filter?: { deptId?: string }): Promise<Employee[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                let res = MOCK_EMPLOYEES;
                if (filter?.deptId) {
                    res = res.filter(e => e.departmentId === filter.deptId);
                }
                resolve(res);
            }, 250);
        });
    }
    async listAlerts(): Promise<AlertEvent[]> {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_ALERTS), 300));
    }
    async getPolicies(): Promise<PolicySettings> {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_POLICY), 150));
    }
}

// HttpApiClient implementation using fetch
class HttpApiClient implements ApiClient {
    async login(req: LoginRequest): Promise<LoginResponse> {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    }
    async getDashboardSummary(): Promise<DashboardSummary> {
        const res = await fetch('/api/dashboard/summary');
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        return res.json();
    }
    async listDepartments(): Promise<Department[]> {
        const res = await fetch('/api/departments');
        return res.json();
    }
    async listEmployees(filter?: { deptId?: string }): Promise<Employee[]> {
        const res = await fetch('/api/users');
        const users = await res.json();
        // Map User entity to Employee interface
        // note: Backend User has 'departmentId' (UUID), Frontend Employee expects 'departmentId' (string)
        // Backend User has 'status' (string), Frontend Employee expects 'status'
        return users.map((u: any) => ({
            id: u.id,
            name: u.name,
            role: u.role,
            email: u.email,
            departmentId: u.departmentId,
            status: u.status || 'ACTIVE',
            lastActive: new Date().toISOString(), // Mock for now
            productivityScore: 85 // Mock for now
        }));
    }
    async listAlerts(): Promise<AlertEvent[]> {
        const res = await fetch('/api/alerts');
        return res.json();
    }
    async getPolicies(): Promise<PolicySettings> {
        const res = await fetch('/api/policies');
        return res.json();
    }
    async listDevices(): Promise<Device[]> {
        const res = await fetch('/api/devices');
        if (!res.ok) throw new Error('Failed to fetch devices');
        return res.json();
    }
}

const api = import.meta.env.VITE_API_MODE === 'http' ? new HttpApiClient() : new MockApiClient();
const ApiContext = createContext<ApiClient>(api);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
