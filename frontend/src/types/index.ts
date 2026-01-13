export interface Department {
    id: string;
    name: string;
    managerName?: string;
    managerId?: string;
    parentId?: string;
    createdAt: string;
    memberCount?: number;
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

export interface Device {
    id: string;
    name: string;
    status: string; // ONLINE, OFFLINE, ERROR
    groupId?: string;
    tenantId: string;
    version: string;
    lastSeenAt: string;
}

export interface DeviceGroup {
    id: string;
    name: string;
    description: string;
    organizationId: string;
    createdAt: string;
    deviceCount?: number; // Optional, for UI display if needed
}

export interface Policy {
    id: string;
    name: string;
    description: string;
    organizationId: string;
    activeVersionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PolicyVersion {
    id: string;
    policyId: string;
    version: number;
    configuration: string; // JSON string
    createdAt: string;
    createdBy?: string;
}

export interface PolicyAck {
    id: string;
    policyId: string;
    versionId: string;
    deviceId: string;
    status: 'PENDING' | 'APPLIED' | 'FAILED';
    message?: string;
    acknowledgedAt?: string;
    syncedAt?: string;
}

export interface EnrollmentToken {
    id: string;
    tokenHash: string; // only for admin view if needed, usually we show partial
    token: string; // The secret (only returned on creation)
    type: 'BOOTSTRAP' | 'REGCODE';
    expiresAt: string;
    maxUses: number;
    usedCount: number;
    revokedAt?: string;
    createdBy: string;
    scopeTenantId: string;
    scopeGroupId?: string;
    createdAt: string;
}
