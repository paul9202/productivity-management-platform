import { RuleContext } from './types';
import { InsightItem, ExecutiveReport } from '../../../types/telemetry';

export const generateExecutiveReport = (
    ctx: RuleContext,
    insights: InsightItem[],
    targetName: string,
    type: 'EXECUTIVE' | 'MANAGER' | 'COMPLIANCE'
): ExecutiveReport => {

    // 1. Generate Summary
    const totalHours = (ctx.timelineBuckets.length * 5) / 60;
    const activeHours = ctx.summary.totalActiveSeconds / 3600;
    const prodScore = ctx.summary.productivityScore;

    const riskInsights = insights.filter(i => i.category === 'RISK');
    const prodInsights = insights.filter(i => i.category === 'PRODUCTIVITY');

    let summaryText = '';
    let conclusion = '';

    if (type === 'EXECUTIVE') {
        summaryText = `Device ${targetName} was active for ${activeHours.toFixed(1)} hours (Score: ${prodScore}). `;
        if (riskInsights.length > 0) {
            summaryText += `Identified ${riskInsights.length} high-priority risk indicators requiring attention. `;
        } else {
            summaryText += `Behavior is within normal operational parameters. `;
        }
        conclusion = riskInsights.length > 0 ? 'Risk Remediation Required' : 'Normal Operation';
    } else if (type === 'MANAGER') {
        const topApp = ctx.topApps[0]?.name || 'None';
        summaryText = `Over the last 24h, ${targetName} demonstrated a productivity score of ${prodScore}. Primary focus was on ${topApp}. `;
        if (prodInsights.length > 0) {
            summaryText += `Noted ${prodInsights.length} productivity gaps (e.g. idle spikes). `;
        }
        if (riskInsights.length > 0) {
            summaryText += `CRITICAL: ${riskInsights.length} security/compliance events triggered. `;
        }
        conclusion = 'Review Detailed Activity Logs';
    } else {
        // Compliance
        summaryText = `Audit Report for ${targetName}. Total Risk Events: ${riskInsights.length}. `;
        summaryText += `USB Events: ${ctx.summary.riskCounters.usbEvents}. Blocked Sites: ${ctx.summary.riskCounters.blocks}.`;
        conclusion = riskInsights.length > 0 ? 'Non-Compliant' : 'Compliant';
    }

    // 2. Format Insights
    const keyInsights = insights.sort((a, b) => b.confidence - a.confidence).slice(0, 5);

    return {
        generatedAt: new Date().toISOString(),
        type,
        target: { name: targetName, id: ctx.summary.deviceId },
        timeRange: 'Last 24 Hours',
        summary: summaryText,
        keyInsights,
        topActivities: {
            apps: ctx.topApps.slice(0, 3).map(a => a.name),
            domains: ctx.topDomains.slice(0, 3).map(a => a.name)
        },
        conclusion,
        disclaimer: 'This report is generated based on automated telemetry analysis and may contain false positives. Please verify with actual logs.'
    };
};
