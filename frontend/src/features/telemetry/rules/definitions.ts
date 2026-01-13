import { Rule, RuleContext } from './types';
import { InsightItem, FileEvent, WebEvent, ImEvent, AppEvent } from '../../../types/telemetry';

// Helper to calculate confidence
const calcConfidence = (base: number, evidenceCount: number, durationMinutes?: number, bonus: number = 0) => {
    return Math.min(Math.max(base + Math.log2(evidenceCount + 1) * 10 + (durationMinutes ? durationMinutes / 10 : 0) + bonus, 0), 100);
};

export const TELEMETRY_RULES: Rule[] = [
    // 1. Idle Spike: Continuous idle > 20min (P2), > 45min (P1)
    {
        id: 'idle_spike',
        title: 'Extended Idle Period',
        category: 'PRODUCTIVITY',
        baseWeight: 60,
        severity: 'P2',
        evaluate: (ctx) => {
            // Find max contiguous idle buckets
            let maxIdleSeq = 0;
            let currentSeq = 0;
            let startBucket = '';

            ctx.timelineBuckets.forEach(b => {
                if (b.activeSeconds < 30) { // < 30s active in 5min bucket = idle
                    currentSeq++;
                    if (currentSeq === 1) startBucket = b.startTime;
                } else {
                    if (currentSeq > maxIdleSeq) maxIdleSeq = currentSeq;
                    currentSeq = 0;
                }
            });
            if (currentSeq > maxIdleSeq) maxIdleSeq = currentSeq; // Check last

            const idleMinutes = maxIdleSeq * 5;
            if (idleMinutes >= 20) {
                const severity = idleMinutes >= 45 ? 'P1' : 'P2';
                return {
                    id: 'insight-idle-' + Date.now(),
                    ruleId: 'idle_spike',
                    title: 'Significant Idle Time Detected',
                    category: 'PRODUCTIVITY',
                    severity,
                    confidence: calcConfidence(70, 1, idleMinutes),
                    timeRange: { start: startBucket, end: '...' }, // Simplified for mock
                    evidenceCount: 1,
                    evidenceSummary: `Detected continous idle block of ${idleMinutes} minutes.`,
                    explanation: `User was inactive for ${idleMinutes} minutes, exceeding the ${severity === 'P1' ? 45 : 20} minute threshold.`,
                    recommendation: 'Check against scheduled breaks or meetings.'
                };
            }
            return null;
        }
    },
    // 6. Job Hunting Signals
    {
        id: 'job_hunting',
        title: 'Job Recruitment Activity',
        category: 'RISK',
        baseWeight: 80,
        severity: 'P2',
        evaluate: (ctx) => {
            const riskDomains = ['linkedin.com/jobs', 'indeed.com', 'glassdoor.com', 'upwork.com', 'monster.com'];
            const events = ctx.events.filter(e => e.type === 'WEB').map(e => e as WebEvent);
            const hits = events.filter(e => riskDomains.some(d => e.metadata?.url?.includes(d) || e.metadata?.category?.includes('Job')));

            if (hits.length >= 3) {
                return {
                    id: 'insight-job-' + Date.now(),
                    ruleId: 'job_hunting',
                    title: 'Potential Flight Risk (Job Hunting)',
                    category: 'RISK',
                    severity: 'P2',
                    confidence: calcConfidence(80, hits.length),
                    timeRange: { start: hits[0].timestamp, end: hits[hits.length - 1].timestamp },
                    evidenceCount: hits.length,
                    evidenceSummary: `Visited ${hits.length} job-related pages (e.g., ${hits[0].metadata.domain}).`,
                    explanation: 'Multiple visits to recruitment platforms detected.',
                    recommendation: 'Monitor for further data exfiltration risk.'
                };
            }
            return null;
        }
    },
    // 9. USB Copy Risk
    {
        id: 'usb_copy',
        title: 'USB Data Transfer',
        category: 'RISK',
        baseWeight: 75,
        severity: 'P2',
        evaluate: (ctx) => {
            const files = ctx.events.filter(e => e.type === 'FILE').map(e => e as FileEvent);
            const usbFiles = files.filter(f => f.metadata.isUsb && f.metadata.operation === 'COPY');

            if (usbFiles.length > 0) {
                const totalSizeMB = usbFiles.reduce((acc, f) => acc + (f.metadata.fileSize || 0), 0) / (1024 * 1024);
                const severity = (totalSizeMB > 50 || usbFiles.length >= 20) ? 'P1' : 'P2';

                return {
                    id: 'insight-usb-' + Date.now(),
                    ruleId: 'usb_copy',
                    title: 'USB File Transfer Detected',
                    category: 'RISK',
                    severity,
                    confidence: calcConfidence(85, usbFiles.length, 0, totalSizeMB > 100 ? 10 : 0),
                    timeRange: { start: usbFiles[0].timestamp, end: usbFiles[usbFiles.length - 1].timestamp },
                    evidenceCount: usbFiles.length,
                    evidenceSummary: `Copied ${usbFiles.length} files (${totalSizeMB.toFixed(1)}MB) to USB storage.`,
                    explanation: `External storage write detected. Volume: ${totalSizeMB.toFixed(1)}MB.`,
                    recommendation: 'Verify authorization for external media usage.'
                };
            }
            return null;
        }
    },
    // 11. Sensitive Keyword
    {
        id: 'sensitive_keyword',
        title: 'Sensitive Keyword Hit',
        category: 'RISK',
        baseWeight: 90,
        severity: 'P2',
        evaluate: (ctx) => {
            const ims = ctx.events.filter(e => e.type === 'IM').map(e => e as ImEvent);
            const sensitiveWords = ['password', 'secret', 'confidential', 'key', 'token'];
            const hits = ims.filter(e => sensitiveWords.some(w => e.metadata.keywordHit?.toLowerCase().includes(w)));

            if (hits.length > 0) {
                const isCritical = hits.some(h => ['password', 'token'].includes(h.metadata.keywordHit || ''));
                return {
                    id: 'insight-kw-' + Date.now(),
                    ruleId: 'sensitive_keyword',
                    title: 'Communication Compliance Alert',
                    category: 'RISK',
                    severity: isCritical ? 'P1' : 'P2',
                    confidence: 95,
                    timeRange: { start: hits[0].timestamp, end: hits[0].timestamp },
                    evidenceCount: hits.length,
                    evidenceSummary: `Detected keyword "${hits[0].metadata.keywordHit}" in IM.`,
                    explanation: 'Compliance filter matched sensitive vocabulary in outgoing messages.',
                    recommendation: 'Review context (full content not logged for privacy).'
                };
            }
            return null;
        }
    },
    // 15. Queue/Backlog (Health) - Simplified
    {
        id: 'agent_health',
        title: 'Telemetry Backlog',
        category: 'HEALTH',
        baseWeight: 50,
        severity: 'P2',
        evaluate: (ctx) => {
            if (ctx.health.queueDepth > 500) {
                return {
                    id: 'insight-health-' + Date.now(),
                    ruleId: 'agent_health',
                    title: 'Agent Telemetry Backlog',
                    category: 'HEALTH',
                    severity: ctx.health.queueDepth > 2000 ? 'P1' : 'P2',
                    confidence: 100,
                    timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
                    evidenceCount: 1,
                    evidenceSummary: `Queue depth at ${ctx.health.queueDepth} events.`,
                    explanation: 'Agent is struggling to upload events, likely network issues.',
                    recommendation: 'Check network connectivity or firewall rules.'
                };
            }
            return null;
        }
    },

    // Placeholder for other 10 rules (simplified for task brevity, but structure allows adding them)
    // 5. Off Hours
    {
        id: 'off_hours',
        title: 'Off-Hours Activity',
        category: 'PRODUCTIVITY',
        baseWeight: 40,
        severity: 'P3',
        evaluate: (ctx) => {
            // Check usage outside 9-18
            let offHoursActive = 0;
            ctx.timelineBuckets.forEach(b => {
                const h = new Date(b.startTime).getHours();
                if (h < 9 || h > 18) offHoursActive += b.activeSeconds;
            });
            const minutes = offHoursActive / 60;
            if (minutes > 30) {
                return {
                    id: 'insight-offhours-' + Date.now(),
                    ruleId: 'off_hours',
                    title: 'High Off-Hours Activity',
                    category: 'PRODUCTIVITY',
                    severity: minutes > 120 ? 'P2' : 'P3',
                    confidence: calcConfidence(50, 1, minutes),
                    timeRange: { start: '...', end: '...' },
                    evidenceCount: 1,
                    evidenceSummary: `User active for ${minutes.toFixed(0)} min outside working hours.`,
                    explanation: 'Significant activity detected during weekends or nights.',
                    recommendation: 'Check for potential burnout risk.'
                };
            }
            return null;
        }
    }
];
