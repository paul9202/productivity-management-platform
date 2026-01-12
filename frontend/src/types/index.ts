export interface Department {
    id: string;
    name: string;
    managerName: string;
    memberCount: number;
}

export interface Employee {
    id: string;
    name: string;
    departmentId: string;
    role: string;
    email: string;
    status: 'ACTIVE' | 'OFFLINE' | 'IDLE';
    avatarUrl?: string; // simplified for UI
}

export interface AppUsageRecord {
    category: 'WORK' | 'COMMUNICATION' | 'ENTERTAINMENT' | 'SOCIAL' | 'OTHER';
    appName: string;
    durationSeconds: number;
}

export interface WebsiteVisitRecord {
    domain: string;
    visits: number;
    durationSeconds: number;
    isBlocked: boolean;
}

export interface AlertEvent {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'IDLE_TIMEOUT' | 'GAZE_AWAY' | 'OFF_TASK_APP' | 'BLOCKED_SITE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    timestamp: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    details: string;
}

export interface DailyProductivitySummary {
    date: string;
    focusScore: number; // 0-100
    activeHours: number;
    idleHours: number;
    offTaskHours: number;
}

export interface DashboardSummary {
    avgFocusScore: number;
    totalActiveHours: number;
    offTaskRatio: number; // percentage
    alertsToday: number;
    trendLast7Days: { date: string; score: number }[];
    topNonWorkApps: { name: string; duration: number }[];
    topBlockedDomains: { domain: string; attempts: number }[];
    departmentStats: { name: string; score: number; alerts: number }[];
}

export interface PolicySettings {
    idleThresholdMinutes: number;
    gazeAwayThresholdSeconds: number;
    offTaskThresholdMinutes: number;
    exemptSchedules: string[]; // e.g. "12:00-13:00"
    whitelistedApps: string[];
    blacklistedSites: string[];
}
