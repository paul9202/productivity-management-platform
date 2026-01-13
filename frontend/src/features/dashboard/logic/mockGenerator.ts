import { DashboardData, DepartmentStats, ExecutiveKPIs, TrendPoint } from '../../../types/dashboard';

// --- Generators ---

const generateTrend = (days: number, volatility: number): TrendPoint[] => {
    const points: TrendPoint[] = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        points.push({
            time: d.toLocaleDateString(),
            active: 200 + Math.random() * 100 * volatility, // Minutes
            idle: 30 + Math.random() * 50 * volatility,
            risk: Math.floor(Math.random() * 5 * volatility),
            health: 90 + Math.random() * 10
        });
    }
    return points;
};

const generateDepartments = (): DepartmentStats[] => [
    {
        id: 'dept-eng', name: 'Engineering', userCount: 45, deviceCount: 52,
        activeMinPerUser: 380, idleRatio: 12, focusIndex: 85, riskScore: 15, onlineRate: 92,
        topRiskType: 'USB_COPY', trend: 'stable'
    },
    {
        id: 'dept-sales', name: 'Sales', userCount: 28, deviceCount: 30,
        activeMinPerUser: 210, idleRatio: 35, focusIndex: 60, riskScore: 5, onlineRate: 78,
        topRiskType: 'WEB_SOCIAL', trend: 'degrading'
    },
    {
        id: 'dept-hr', name: 'HR', userCount: 8, deviceCount: 10,
        activeMinPerUser: 250, idleRatio: 20, focusIndex: 72, riskScore: 45, onlineRate: 95,
        topRiskType: 'SENSITIVE_KEYWORD', trend: 'improving'
    },
    {
        id: 'dept-fin', name: 'Finance', userCount: 12, deviceCount: 12,
        activeMinPerUser: 310, idleRatio: 15, focusIndex: 78, riskScore: 80, onlineRate: 98,
        topRiskType: 'CLOUD_DRIVE', trend: 'stable'
    },
    {
        id: 'dept-mkt', name: 'Marketing', userCount: 18, deviceCount: 20,
        activeMinPerUser: 280, idleRatio: 28, focusIndex: 65, riskScore: 10, onlineRate: 85,
        topRiskType: 'WEB_STREAMING', trend: 'stable'
    }
];

export const generateMockDashboard = (): DashboardData => {
    // 1. Departments
    const depts = generateDepartments();

    // 2. Aggregate for KPIs
    const totalUsers = depts.reduce((acc, d) => acc + d.userCount, 0);
    const avgActive = depts.reduce((acc, d) => acc + d.activeMinPerUser * d.userCount, 0) / totalUsers;
    const avgFocus = depts.reduce((acc, d) => acc + d.focusIndex * d.userCount, 0) / totalUsers;
    const avgRisk = depts.reduce((acc, d) => acc + d.riskScore * d.userCount, 0) / totalUsers;
    const totalOnline = depts.reduce((acc, d) => acc + (d.onlineRate / 100 * d.deviceCount), 0);
    const totalDevices = depts.reduce((acc, d) => acc + d.deviceCount, 0);

    const kpis: ExecutiveKPIs = {
        onlineDevices: {
            id: 'kpi-online', label: 'Online Devices',
            value: `${Math.floor(totalOnline)} / ${totalDevices}`,
            color: 'success',
            trend: { value: 2.5, direction: 'up', isGood: true, label: 'vs yesterday' }
        },
        activeMinutes: {
            id: 'kpi-active', label: 'Avg Active Time',
            value: `${Math.floor(avgActive / 60)}h ${Math.floor(avgActive % 60)}m`,
            trend: { value: 5, direction: 'up', isGood: true, label: 'vs last week' }
        },
        idleRatio: {
            id: 'kpi-idle', label: 'Global Idle Ratio',
            value: '22%',
            trend: { value: 4, direction: 'up', isGood: false, label: 'increasing' }, // Bad trend
            color: 'warning'
        },
        focusIndex: {
            id: 'kpi-focus', label: 'Focus Score',
            value: Math.floor(avgFocus),
            trend: { value: 1.2, direction: 'flat', isGood: true, label: 'stable' }
        },
        productiveAppShare: {
            id: 'kpi-apps', label: 'Prod. App Share',
            value: '68%',
            trend: { value: 3, direction: 'up', isGood: true }
        },
        riskAlerts: {
            id: 'kpi-risk', label: 'Risk Alerts Today',
            value: 12,
            color: 'danger',
            trend: { value: 20, direction: 'up', isGood: false, label: 'spike detected' }
        },
        policyCompliance: {
            id: 'kpi-policy', label: 'Policy Compl.',
            value: '94%',
            color: 'success',
            trend: { value: 0.5, direction: 'up', isGood: true }
        },
        dataHealth: {
            id: 'kpi-health', label: 'Data Health',
            value: '99.2%',
            trend: { value: 0, direction: 'flat', isGood: true }
        }
    };

    return {
        generatedAt: new Date().toISOString(),
        kpis,
        departments: depts,
        trends: {
            daily: generateTrend(7, 1.2),
            hourly: generateTrend(24, 0.5), // Mocking hourly as same struct
        },
        riskBreakdown: [
            { type: 'USB_COPY', count: 45 },
            { type: 'CLOUD_UPLOAD', count: 28 },
            { type: 'KEYWORD', count: 12 },
            { type: 'BLOCKED', count: 56 }
        ],
        topIssues: [] // Populated by Rule Engine later
    };
};
