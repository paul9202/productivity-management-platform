import {
    TelemetrySummary,
    TimelineBucket,
    TelemetryEvent,
    TelemetryEventType,
    AppEvent,
    WebEvent,
    FileEvent,
    ImEvent,
    TopItem
} from '../../types/telemetry';

// Utilities
const subMinutes = (date: Date, minutes: number) => new Date(date.getTime() - minutes * 60000);
const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000);
const fmtDate = (date: Date) => date.toISOString();

// Constants
const APPS = [
    { name: 'Visual Studio Code', category: 'Development', app: 'Code.exe' },
    { name: 'Chrome', category: 'Browser', app: 'chrome.exe' },
    { name: 'Slack', category: 'Communication', app: 'slack.exe' },
    { name: 'Outlook', category: 'Productivity', app: 'outlook.exe' },
    { name: 'Steam', category: 'Games', app: 'steam.exe' },
    { name: 'Spotify', category: 'Entertainment', app: 'spotify.exe' },
];

const DOMAINS = [
    { domain: 'github.com', category: 'Development' },
    { domain: 'stackoverflow.com', category: 'Development' },
    { domain: 'linkedin.com', category: 'Social' },
    { domain: 'youtube.com', category: 'Entertainment' },
    { domain: 'upwork.com', category: 'Risk (Job)' },
    { domain: 'dropbox.com', category: 'Storage' },
];

// Generator State
let mockEvents: TelemetryEvent[] = [];
let mockBuckets: TimelineBucket[] = [];
let mockSummary: TelemetrySummary | null = null;

// Helper to generate a batch of events
const generateMockData = (deviceId: string) => {
    if (mockEvents.length > 0) return; // Already generated

    const now = new Date();
    const startTime = subMinutes(now, 24 * 60); // 24 hours ago

    // Simulate "Persona A: The Risk User" (if deviceId ends in 1 or odd)
    // Simulate "Persona B: The Good Employee" (if deviceId ends in 2 or even)
    const isRiskUser = true; // For demo, always include risks for now

    let cursor = new Date(startTime);

    while (cursor <= now) {
        // Create 5-minute buckets
        const bucketEnd = addMinutes(cursor, 5);

        // Randomly decide activity state for this bucket
        const hour = cursor.getHours();
        const isWorkHours = hour >= 9 && hour <= 18;

        let activeSec = 0;
        let idleSec = 0;
        let lockedSec = 0;

        // Base Probabilities
        if (isWorkHours) {
            activeSec = Math.floor(Math.random() * 250) + 50; // mostly active
        } else {
            if (Math.random() > 0.7) {
                activeSec = Math.floor(Math.random() * 100); // occasional work
            } else {
                idleSec = 300; // sleep mode
            }
        }

        // Ensure total <= 300
        if (activeSec + idleSec > 300) {
            idleSec = 300 - activeSec;
        }

        // Fill bucket stats
        const bucket: TimelineBucket = {
            startTime: fmtDate(cursor),
            endTime: fmtDate(bucketEnd),
            activeSeconds: activeSec,
            idleSeconds: idleSec,
            lockedSeconds: 300 - (activeSec + idleSec),
            topApp: APPS[Math.floor(Math.random() * APPS.length)].name,
            topDomain: DOMAINS[Math.floor(Math.random() * DOMAINS.length)].domain,
            eventCounts: { block: 0, file: 0, im: 0, alert: 0 }
        };

        // --- Generate Specific Events within this bucket ---

        // 1. Idle Spike (Rule 1)
        if (hour === 14 && cursor.getMinutes() < 30) {
            bucket.activeSeconds = 0;
            bucket.idleSeconds = 300;
            // No events generated
        }

        // 2. Risk Browsing (Job Hunting) (Rule 6)
        if (isRiskUser && hour === 11 && cursor.getMinutes() < 15) {
            mockEvents.push({
                id: crypto.randomUUID(),
                deviceId, userId: 'user-1',
                timestamp: addMinutes(cursor, 1).toISOString(),
                type: 'WEB',
                metadata: {
                    url: 'https://upwork.com/jobs/freelance',
                    domain: 'upwork.com',
                    category: 'Risk (Job)',
                    title: 'Freelance Jobs - Upwork',
                    durationSeconds: 120,
                    visitCount: 1
                }
            } as WebEvent);
        }

        // 3. USB Copy Risk (Rule 9)
        if (isRiskUser && hour === 16 && cursor.getMinutes() > 45) {
            bucket.eventCounts.file += 5;
            for (let i = 0; i < 5; i++) {
                mockEvents.push({
                    id: crypto.randomUUID(),
                    deviceId, userId: 'user-1',
                    timestamp: addMinutes(cursor, i).toISOString(),
                    type: 'FILE',
                    metadata: {
                        operation: 'COPY',
                        filePath: `E:\\Confidential_Project_${i}.zip`,
                        fileSize: 1024 * 1024 * 50, // 50MB
                        isUsb: true,
                        isNetworkShare: false
                    }
                } as FileEvent);
            }
        }

        // 4. Sensitive Keyword (Rule 11)
        if (isRiskUser && hour === 10) {
            bucket.eventCounts.im += 1;
            mockEvents.push({
                id: crypto.randomUUID(),
                deviceId, userId: 'user-1',
                timestamp: addMinutes(cursor, 2).toISOString(),
                type: 'IM',
                metadata: {
                    platform: 'Slack',
                    keywordHit: 'password',
                    snippet: 'Here is the admin password for reference...'
                }
            } as ImEvent);
        }

        // 5. Regular App Usage
        if (bucket.activeSeconds > 0) {
            const app = APPS[Math.floor(Math.random() * APPS.length)];
            mockEvents.push({
                id: crypto.randomUUID(),
                deviceId, userId: 'user-1',
                timestamp: addMinutes(cursor, 0).toISOString(),
                type: 'APP',
                metadata: {
                    appName: app.name,
                    processName: app.app,
                    category: app.category,
                    windowTitle: 'Project - ' + app.name,
                    durationSeconds: bucket.activeSeconds
                }
            } as AppEvent);
        }

        mockBuckets.push(bucket);
        cursor = bucketEnd;
    }
};

export const getMockTelemetrySummary = async (deviceId: string): Promise<TelemetrySummary> => {
    generateMockData(deviceId);

    // Aggregate from buckets
    const totalActive = mockBuckets.reduce((acc, b) => acc + b.activeSeconds, 0);
    const totalIdle = mockBuckets.reduce((acc, b) => acc + b.idleSeconds, 0); // Include forced idle
    const totalLocked = mockBuckets.reduce((acc, b) => acc + b.lockedSeconds, 0);

    // Calc Scores
    const productivityScore = Math.floor((totalActive / (totalActive + totalIdle + 1)) * 100);

    // Top Apps Aggregation
    const appMap = new Map<string, number>();
    mockEvents.filter(e => e.type === 'APP').forEach(e => {
        const ae = e as AppEvent;
        appMap.set(ae.metadata.appName, (appMap.get(ae.metadata.appName) || 0) + ae.metadata.durationSeconds);
    });

    const topApps: TopItem[] = Array.from(appMap.entries())
        .map(([name, dur]) => ({ name, durationSeconds: dur, category: 'App' }))
        .sort((a, b) => b.durationSeconds - a.durationSeconds)
        .slice(0, 5);

    // Top Domains Aggregation
    const domainMap = new Map<string, number>();
    mockEvents.filter(e => e.type === 'WEB').forEach(e => {
        const we = e as WebEvent;
        domainMap.set(we.metadata.domain, (domainMap.get(we.metadata.domain) || 0) + we.metadata.durationSeconds);
    });
    const topDomains: TopItem[] = Array.from(domainMap.entries())
        .map(([name, dur]) => ({ name, durationSeconds: dur, category: 'Web' }))
        .sort((a, b) => b.durationSeconds - a.durationSeconds)
        .slice(0, 5);

    return {
        deviceId,
        userId: 'user-1',
        from: subMinutes(new Date(), 24 * 60).toISOString(),
        to: new Date().toISOString(),
        totalActiveSeconds: totalActive,
        totalIdleSeconds: totalIdle,
        totalLockedSeconds: totalLocked,
        productivityScore: productivityScore > 100 ? 100 : productivityScore,
        riskScore: 65, // Static for now, rule engine will refine
        topApps,
        topDomains,
        riskCounters: {
            blocks: 3,
            sensitiveKeywords: 1,
            usbEvents: 5,
            anomalies: 2
        },
        status: {
            online: true,
            lastSeenAt: new Date().toISOString(),
            agentVersion: '1.2.0',
            policyVersion: 'v45',
            ackStatus: 'ACKNOWLEDGED'
        }
    };
};

export const getMockTimeline = async (deviceId: string): Promise<TimelineBucket[]> => {
    generateMockData(deviceId);
    return mockBuckets;
};

export const getMockEvents = async (deviceId: string, type?: TelemetryEventType): Promise<TelemetryEvent[]> => {
    generateMockData(deviceId);
    if (!type) return mockEvents;
    return mockEvents.filter(e => e.type === type);
};
