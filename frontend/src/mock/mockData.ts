import { AlertEvent, DashboardSummary, Department, Employee, PolicySettings } from '../types';

export const MOCK_DEPARTMENTS: Department[] = [
    { id: 'dept-1', name: 'Engineering', managerName: 'Alice Johnson', memberCount: 12, createdAt: new Date().toISOString() },
    { id: 'dept-2', name: 'Sales', managerName: 'Bob Smith', memberCount: 8, createdAt: new Date().toISOString() },
    { id: 'dept-3', name: 'Marketing', managerName: 'Charlie Brown', memberCount: 6, createdAt: new Date().toISOString() },
    { id: 'dept-4', name: 'HR', managerName: 'Diana Prince', memberCount: 4, createdAt: new Date().toISOString() },
];

const NAMES = ['John Doe', 'Jane Smith', 'Michael Chen', 'Sarah Connor', 'Kyle Reese', 'Tony Stark', 'Steve Rogers', 'Natasha Romanoff', 'Bruce Banner', 'Clint Barton', 'Wanda Maximoff', 'Vision', 'Sam Wilson', 'Bucky Barnes', 'Peter Parker', 'Stephen Strange', 'TChalla', 'Scott Lang', 'Hope Dyne', 'Carol Danvers'];

export const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 20 }, (_, i) => ({
    id: `i`,
    name: NAMES[i % NAMES.length],
    departmentId: MOCK_DEPARTMENTS[i % 4].id,
    role: i % 4 === 0 ? 'Manager' : 'Contributor',
    email: `${NAMES[i % NAMES.length].toLowerCase().replace(' ', '.')}@company.com`,
    status: Math.random() > 0.8 ? 'OFFLINE' : Math.random() > 0.6 ? 'IDLE' : 'ACTIVE',
}));

export const MOCK_ALERTS: AlertEvent[] = Array.from({ length: 50 }, (_, i) => ({
    id: `alert-{i}`,
    employeeId: `emp-${i % 20}`,
    employeeName: NAMES[i % 20],
    type: i % 3 === 0 ? 'IDLE_TIMEOUT' : i % 3 === 1 ? 'OFF_TASK_APP' : 'BLOCKED_SITE',
    severity: i % 5 === 0 ? 'HIGH' : i % 5 === 1 ? 'MEDIUM' : 'LOW',
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(), // last 3 days
    acknowledged: Math.random() > 0.7,
    details: 'Detected non-compliant activity during work hours.',
}));

export const MOCK_DASHBOARD: DashboardSummary = {
    avgFocusScore: 78,
    totalActiveHours: 1240,
    offTaskRatio: 12,
    alertsToday: 5,
    trendLast7Days: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
        score: 70 + Math.floor(Math.random() * 20),
    })),
    topNonWorkApps: [
        { name: 'Instagram', duration: 120 },
        { name: 'YouTube', duration: 95 },
        { name: 'Steam', duration: 45 },
    ],
    topBlockedDomains: [
        { domain: 'facebook.com', attempts: 45 },
        { domain: 'twitter.com', attempts: 32 },
    ],
    departmentStats: MOCK_DEPARTMENTS.map(d => ({
        name: d.name,
        score: 70 + Math.floor(Math.random() * 20),
        alerts: Math.floor(Math.random() * 10),
    })),
};

export const MOCK_POLICY: PolicySettings = {
    idleThresholdMinutes: 5,
    gazeAwayThresholdSeconds: 30,
    offTaskThresholdMinutes: 10,
    exemptSchedules: ['12:00-13:00', 'Sat-Sun'],
    whitelistedApps: ['VS Code', 'Chrome', 'Slack', 'Zoom'],
    blacklistedSites: ['facebook.com', 'twitter.com', 'tiktok.com'],
};
