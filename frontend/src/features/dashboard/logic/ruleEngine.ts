import { DashboardData, TopIssue } from '../../../types/dashboard';

// Helper for confidence calculation
const calcConf = (base: number, evidence: number) => Math.min(100, Math.max(0, base + Math.log2(evidence + 1) * 10));

export const evaluateOrgRules = (data: DashboardData): TopIssue[] => {
    const issues: TopIssue[] = [];

    // R1: Online Rate Drop
    // Simulated Check: If online rate KPI trend is down > 10%
    if (data.kpis.onlineDevices.trend?.direction === 'down' && Math.abs(data.kpis.onlineDevices.trend?.value || 0) > 10) {
        issues.push({
            id: 'R1', title: 'Significant Drop in Online Devices',
            category: 'HEALTH', severity: 'P1',
            confidence: 90,
            impact: 'Global',
            evidence: `Online rate dropped by ${data.kpis.onlineDevices.trend.value}% since yesterday.`,
            recommendation: { label: 'Diagnose Connectivity', action: 'DIAGNOSE' }
        });
    }

    // R2: Idle Spike (Per Dept)
    data.departments.forEach(dept => {
        if (dept.idleRatio > 30) {
            issues.push({
                id: `R2-${dept.id}`, title: `High Idle Ratio in ${dept.name}`,
                category: 'PRODUCTIVITY', severity: 'P2',
                confidence: calcConf(70, dept.userCount),
                impact: `${dept.userCount} Users`,
                evidence: `${dept.name} idle ratio is ${dept.idleRatio}% (Avg: 22%).`,
                recommendation: { label: 'View Department', action: 'NAVIGATE', target: `/departments` }
            });
        }
    });

    // R3: Risk Spike
    const totalRisks = data.riskBreakdown.reduce((a, b) => a + b.count, 0);
    if (totalRisks > 100) {
        issues.push({
            id: 'R3', title: 'Surge in Risk Events',
            category: 'RISK', severity: 'P1',
            confidence: 95,
            impact: 'Organization Wide',
            evidence: `${totalRisks} risk events detected today (Normal: <50).`,
            recommendation: { label: 'View Alerts', action: 'NAVIGATE', target: '/alerts' }
        });
    }

    // R4: Focus Index Low
    data.departments.filter(d => d.focusIndex < 60).forEach(dept => {
        issues.push({
            id: `R4-${dept.id}`, title: `Low Focus in ${dept.name}`,
            category: 'PRODUCTIVITY', severity: 'P2',
            confidence: 80,
            impact: `${dept.userCount} Users`,
            evidence: `Focus Index ${dept.focusIndex}/100 is below threshold.`,
            recommendation: { label: 'Analyze Apps', action: 'NAVIGATE', target: `/departments` }
        });
    });

    // R8: Top Risky Departments
    const riskyDepts = [...data.departments].sort((a, b) => b.riskScore - a.riskScore).slice(0, 1);
    if (riskyDepts[0].riskScore > 50) {
        issues.push({
            id: 'R8', title: `High Risk Score: ${riskyDepts[0].name}`,
            category: 'RISK', severity: 'P1',
            confidence: 85,
            impact: `${riskyDepts[0].name}`,
            evidence: `Primary risk vector: ${riskyDepts[0].topRiskType}. Score: ${riskyDepts[0].riskScore}.`,
            recommendation: { label: 'Investigate Team', action: 'NAVIGATE', target: `/departments` }
        });
    }

    // Mocking R12 Exfil Pattern
    if (data.riskBreakdown.find(r => r.type === 'USB_COPY')?.count || 0 > 20) {
        issues.push({
            id: 'R12', title: 'Potential Data Exfiltration Pattern',
            category: 'RISK', severity: 'P1',
            confidence: 65,
            impact: 'Multiple Departments',
            evidence: 'Correlated USB Copy and Cloud Upload events detected.',
            recommendation: { label: 'Review Policy', action: 'DIAGNOSE' }
        });
    }

    return issues.sort((a, b) => (a.severity === 'P1' ? -1 : 1)); // P1 first
};
