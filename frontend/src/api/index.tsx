import {
    DashboardSummary, Department, Employee, AlertEvent, PolicySettings
} from '../types';
import { MOCK_ALERTS, MOCK_DASHBOARD, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_POLICY } from '../mock/mockData';
import React, { createContext, useContext } from 'react';

export interface ApiClient {
    getDashboardSummary(): Promise<DashboardSummary>;
    listDepartments(): Promise<Department[]>;
    listEmployees(filter?: { deptId?: string }): Promise<Employee[]>;
    listAlerts(): Promise<AlertEvent[]>;
    getPolicies(): Promise<PolicySettings>;
}

class MockApiClient implements ApiClient {
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

// HttpApiClient placeholder - in real app would use fetch/axios
// HttpApiClient implementation using fetch
class HttpApiClient implements ApiClient {
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
        // Query params could be added here
        const res = await fetch('/api/employees');
        return res.json();
    }
    async listAlerts(): Promise<AlertEvent[]> {
        const res = await fetch('/api/alerts');
        return res.json();
    }
    async getPolicies(): Promise<PolicySettings> {
        const res = await fetch('/api/policies');
        return res.json();
    }
}

const api = import.meta.env.VITE_API_MODE === 'http' ? new HttpApiClient() : new MockApiClient();
const ApiContext = createContext<ApiClient>(api);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
