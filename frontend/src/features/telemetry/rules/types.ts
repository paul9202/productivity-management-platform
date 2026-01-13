import {
    TelemetrySummary,
    TimelineBucket,
    TelemetryEvent,
    TopItem,
    InsightItem,
    InsightSeverity,
    InsightCategory
} from '../../../types/telemetry';

export interface RuleContext {
    summary: TelemetrySummary;
    timelineBuckets: TimelineBucket[];
    events: TelemetryEvent[];
    topApps: TopItem[];
    topDomains: TopItem[];
    workHoursConfig: { start: number; end: number }; // e.g., 9, 18
    health: {
        queueDepth: number;
        lastUploadAt: string;
        policyVersion: string;
    };
}

export interface Rule {
    id: string;
    title: string;
    category: InsightCategory;
    baseWeight: number; // 0-100 base probability
    severity: InsightSeverity;

    // The core logic: returns an InsightItem if triggered, or null
    evaluate: (ctx: RuleContext) => InsightItem | null;
}
