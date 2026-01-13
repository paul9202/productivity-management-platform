export type TelemetryEventType = 'APP' | 'WEB' | 'FILE' | 'BLOCK' | 'IM' | 'ALERT';

export interface TelemetryEvent {
    id: string;
    deviceId: string;
    userId: string;
    timestamp: string; // ISO 8601
    type: TelemetryEventType;
    metadata: Record<string, any>;
}

export interface AppEvent extends TelemetryEvent {
    type: 'APP';
    metadata: {
        appName: string;
        windowTitle: string;
        category: string; // e.g., 'Productivity', 'Social', 'Game'
        durationSeconds: number;
        processName: string;
    };
}

export interface WebEvent extends TelemetryEvent {
    type: 'WEB';
    metadata: {
        url: string;
        domain: string;
        title: string;
        category: string; // e.g., 'Business', 'Shopping', 'Risk'
        durationSeconds: number; // For active browsing
        visitCount: number;
    };
}

export interface FileEvent extends TelemetryEvent {
    type: 'FILE';
    metadata: {
        operation: 'COPY' | 'MOVE' | 'DELETE' | 'CREATE' | 'MODIFY';
        filePath: string;
        fileSize: number;
        isUsb: boolean;
        isNetworkShare: boolean;
        targetPath?: string;
    };
}

export interface BlockEvent extends TelemetryEvent {
    type: 'BLOCK';
    metadata: {
        target: string; // url or app path
        policyId: string;
        ruleName: string;
        action: 'BLOCK' | 'WARN';
    };
}

export interface ImEvent extends TelemetryEvent {
    type: 'IM';
    metadata: {
        platform: string; // e.g., 'Slack', 'WhatsApp'
        keywordHit?: string; // Only the hit word
        snippet?: string; // Short snippet < 120 chars
    };
}

export interface TimelineBucket {
    startTime: string; // ISO
    endTime: string;
    activeSeconds: number;
    idleSeconds: number;
    lockedSeconds: number;
    topApp: string; // Most used app in this bucket
    topDomain: string; // Most visited domain
    eventCounts: {
        block: number;
        file: number;
        im: number;
        alert: number;
    };
}

export interface TopItem {
    name: string;
    category: string;
    durationSeconds: number;
    icon?: string;
}

export interface TelemetrySummary {
    deviceId: string;
    userId: string;
    from: string;
    to: string;
    totalActiveSeconds: number;
    totalIdleSeconds: number;
    totalLockedSeconds: number;
    productivityScore: number; // 0-100
    riskScore: number; // 0-100 (High implies risk)
    topApps: TopItem[];
    topDomains: TopItem[];
    riskCounters: {
        blocks: number;
        sensitiveKeywords: number;
        usbEvents: number;
        anomalies: number;
    };
    status: {
        online: boolean;
        lastSeenAt: string;
        agentVersion: string;
        policyVersion: string;
        ackStatus: 'ACKNOWLEDGED' | 'PENDING' | 'FAILED';
    };
}

// AI / Insights Types
export type InsightSeverity = 'P1' | 'P2' | 'P3';
export type InsightCategory = 'PRODUCTIVITY' | 'RISK' | 'HEALTH';

export interface InsightItem {
    id: string;
    ruleId: string;
    title: string;
    category: InsightCategory;
    severity: InsightSeverity;
    confidence: number; // 0-100
    timeRange: {
        start: string;
        end: string;
    };
    evidenceCount: number;
    evidenceSummary: string; // Brief text: "35 files copied to USB"
    explanation: string; // Why it triggered: "Exceeded threshold of 20 files in 10min"
    recommendation: string; // "Check USB logs"
}

export interface ExecutiveReport {
    generatedAt: string;
    type: 'EXECUTIVE' | 'MANAGER' | 'COMPLIANCE';
    target: {
        name: string; // Device or User name
        id: string;
    };
    timeRange: string; // "Last 24 Hours"
    summary: string; // The natural language summary
    keyInsights: InsightItem[]; // Filtered top insights
    topActivities: {
        apps: string[];
        domains: string[];
    };
    conclusion: string;
    disclaimer: string;
}
