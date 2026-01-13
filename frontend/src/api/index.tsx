import {
    DashboardSummary, Department, Employee, AlertEvent, PolicySettings, Device, DeviceGroup
} from '../types';
import { LoginRequest, LoginResponse } from '../types/auth';
import { MOCK_ALERTS, MOCK_DASHBOARD, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_POLICY } from '../mock/mockData';
import React, { createContext, useContext } from 'react';

export interface ApiClient {
    login(req: LoginRequest): Promise<LoginResponse>;
    getDashboardSummary(): Promise<DashboardSummary>;

    // Departments
    listDepartments(): Promise<Department[]>;
    createDepartment(dept: Partial<Department>): Promise<Department>;
    updateDepartment(id: string, dept: Partial<Department>): Promise<Department>;
    deleteDepartment(id: string): Promise<void>;

    // Employees
    listEmployees(filter?: { deptId?: string }): Promise<Employee[]>;
    createEmployee(emp: Partial<Employee>): Promise<Employee>; // Maps to User backend
    updateEmployee(id: string, emp: Partial<Employee>): Promise<Employee>;
    deleteEmployee(id: string): Promise<void>;

    listAlerts(): Promise<AlertEvent[]>;
    getPolicies(): Promise<PolicySettings>;

    // Devices
    listDevices(): Promise<Device[]>;
    updateDevice(id: string, device: Partial<Device>): Promise<Device>;
    deleteDevice(id: string): Promise<void>;

    listDeviceGroups(): Promise<DeviceGroup[]>;
    createDeviceGroup(group: Partial<DeviceGroup>): Promise<DeviceGroup>;
    updateDeviceGroup(id: string, group: Partial<DeviceGroup>): Promise<DeviceGroup>;
    deleteDeviceGroup(id: string): Promise<void>;
}

class MockApiClient implements ApiClient {
    async listDeviceGroups(): Promise<DeviceGroup[]> {
        return new Promise(resolve => setTimeout(() => resolve([
            { id: 'g1', name: 'Engineering Laptops', description: 'All engineering devices', organizationId: 'org1', createdAt: new Date().toISOString() },
            { id: 'g2', name: 'Sales Tablets', description: 'Field sales devices', organizationId: 'org1', createdAt: new Date().toISOString() }
        ]), 300));
    }
    async createDeviceGroup(group: Partial<DeviceGroup>): Promise<DeviceGroup> {
        return new Promise(resolve => setTimeout(() => resolve({
            id: 'g-new-' + Date.now(),
            name: group.name!,
            description: group.description!,
            organizationId: 'org1',
            createdAt: new Date().toISOString()
        } as DeviceGroup), 300));
    }
    async updateDeviceGroup(id: string, group: Partial<DeviceGroup>): Promise<DeviceGroup> {
        return new Promise(resolve => setTimeout(() => resolve({
            ...group, id
        } as DeviceGroup), 300));
    }
    async deleteDeviceGroup(_id: string): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 300));
    }
    async listDevices(): Promise<Device[]> {
        return new Promise(resolve => setTimeout(() => resolve([
            { id: 'dev-1', name: 'Mock Device 1', status: 'ONLINE', groupId: 'g1', tenantId: 't1', version: '1.0', lastSeenAt: new Date().toISOString() },
            { id: 'dev-2', name: 'Mock Device 2', status: 'OFFLINE', groupId: 'g1', tenantId: 't1', version: '1.0', lastSeenAt: new Date().toISOString() }
        ]), 300));
    }
    async updateDevice(id: string, device: Partial<Device>): Promise<Device> {
        return new Promise(resolve => setTimeout(() => resolve({
            ...device, id
        } as Device), 300));
    }
    async deleteDevice(_id: string): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 300));
    }

    // Departments Mock
    async createDepartment(dept: Partial<Department>): Promise<Department> {
        return new Promise(resolve => setTimeout(() => resolve({ ...dept, id: 'dept-new' } as Department), 300));
    }
    async updateDepartment(id: string, dept: Partial<Department>): Promise<Department> {
        return new Promise(resolve => setTimeout(() => resolve({ ...dept, id } as Department), 300));
    }
    async deleteDepartment(_id: string): Promise<void> { return new Promise(resolve => setTimeout(resolve, 300)); }

    // Employees Mock
    async createEmployee(emp: Partial<Employee>): Promise<Employee> {
        return new Promise(resolve => setTimeout(() => resolve({ ...emp, id: 'emp-new' } as Employee), 300));
    }
    async updateEmployee(id: string, emp: Partial<Employee>): Promise<Employee> {
        return new Promise(resolve => setTimeout(() => resolve({ ...emp, id } as Employee), 300));
    }
    async deleteEmployee(_id: string): Promise<void> { return new Promise(resolve => setTimeout(resolve, 300)); }
    async login(req: LoginRequest): Promise<LoginResponse> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (req.password === 'password') {
                    resolve({
                        token: 'mock-jwt-token',
                        user: {
                            id: 'u-admin',
                            name: 'Demo Admin',
                            email: req.username || 'admin@demo.com',
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
    async listEmployees(_filter?: { deptId?: string }): Promise<Employee[]> {
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
    async listDeviceGroups(): Promise<DeviceGroup[]> {
        const res = await fetch('/api/device-groups');
        if (!res.ok) throw new Error('Failed to fetch device groups');
        return res.json();
    }
    async createDeviceGroup(group: Partial<DeviceGroup>): Promise<DeviceGroup> {
        const res = await fetch('/api/device-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(group)
        });
        if (!res.ok) throw new Error('Failed to create device group');
        return res.json();
    }
    async updateDeviceGroup(id: string, group: Partial<DeviceGroup>): Promise<DeviceGroup> {
        const res = await fetch(`/api/device-groups/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(group)
        });
        if (!res.ok) throw new Error('Failed to update device group');
        return res.json();
    }
    async deleteDeviceGroup(id: string): Promise<void> {
        const res = await fetch(`/api/device-groups/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete device group');
    }

    // Departments HTTP
    async createDepartment(dept: Partial<Department>): Promise<Department> {
        const res = await fetch('/api/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dept)
        });
        if (!res.ok) throw new Error('Failed to create department');
        return res.json();
    }
    async updateDepartment(id: string, dept: Partial<Department>): Promise<Department> {
        const res = await fetch(`/api/departments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dept)
        });
        if (!res.ok) throw new Error('Failed to update department');
        return res.json();
    }
    async deleteDepartment(id: string): Promise<void> {
        const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete department');
    }

    // Employees HTTP
    async createEmployee(emp: Partial<Employee>): Promise<Employee> {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emp) // Backend expects User, Frontend sends Employee (need mapping if different)
        });
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
    }
    async updateEmployee(id: string, emp: Partial<Employee>): Promise<Employee> {
        const res = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emp)
        });
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
    }
    async deleteEmployee(id: string): Promise<void> {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete user');
    }

    // Devices HTTP
    async updateDevice(id: string, device: Partial<Device>): Promise<Device> {
        const res = await fetch(`/api/devices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(device)
        });
        if (!res.ok) throw new Error('Failed to update device');
        return res.json();
    }
    async deleteDevice(id: string): Promise<void> {
        const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete device');
    }
}

// @ts-ignore
const api = import.meta.env.VITE_API_MODE === 'http' ? new HttpApiClient() : new MockApiClient();
const ApiContext = createContext<ApiClient>(api);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
