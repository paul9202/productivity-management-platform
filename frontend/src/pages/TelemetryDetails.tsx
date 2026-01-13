import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../api';
import {
    TelemetrySummary, TimelineBucket, TelemetryEvent, InsightItem
} from '../types/telemetry';
import { RuleEngine } from '../features/telemetry/rules/engine';
import { TELEMETRY_RULES } from '../features/telemetry/rules/definitions';
import { generateExecutiveReport } from '../features/telemetry/rules/langGenerator';
import { ExecutiveSummary } from '../components/telemetry/ExecutiveSummary';
import { BehaviorTimeline } from '../components/telemetry/BehaviorTimeline';
import { DeepDiveTabs } from '../components/telemetry/DeepDiveTabs';
import { InsightsPanel } from '../components/telemetry/InsightsPanel';
import { AICopilotModal } from '../components/telemetry/AICopilotModal';
import { Bot, RefreshCw, ArrowLeft, Download, Sparkles, Clock, ShieldAlert } from 'lucide-react';

const TelemetryDetails: React.FC = () => {
    const { deviceId } = useParams<{ deviceId: string }>();
    const navigate = useNavigate();
    const api = useApi();

    // Data State
    const [summary, setSummary] = useState<TelemetrySummary | null>(null);
    const [timeline, setTimeline] = useState<TimelineBucket[]>([]);
    const [events, setEvents] = useState<TelemetryEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [showCopilot, setShowCopilot] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState<TelemetryEvent[]>([]);
    const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');

    // Insights State
    const [insights, setInsights] = useState<InsightItem[]>([]);
    const [managerSnapshot, setManagerSnapshot] = useState('');

    const fetchData = async () => {
        if (!deviceId) return;
        setLoading(true);
        try {
            // Parallel Fetch
            const [sum, time, evts] = await Promise.all([
                api.getTelemetrySummary(deviceId),
                api.getTelemetryTimeline(deviceId),
                api.getTelemetryEvents(deviceId)
            ]);

            setSummary(sum);
            setTimeline(time);
            setEvents(evts);
            setFilteredEvents(evts); // Default showing all

            // --- Run Pseudo AI Engine ---
            const engine = new RuleEngine(TELEMETRY_RULES);
            const ctx = {
                summary: sum,
                timelineBuckets: time,
                events: evts,
                topApps: sum.topApps,
                topDomains: sum.topDomains,
                workHoursConfig: { start: 9, end: 18 },
                health: { queueDepth: 120, lastUploadAt: new Date().toISOString(), policyVersion: sum.status?.policyVersion || 'v1' }
            };
            const generatedInsights = engine.evaluateAll(ctx);
            setInsights(generatedInsights);

            // Generate Manager Snapshot
            const briefReport = generateExecutiveReport(ctx, generatedInsights, 'This Device', 'MANAGER');
            setManagerSnapshot(briefReport.summary);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [deviceId]);

    // Handle Time Brush
    const handleBrushChange = (startIdx: number, endIdx: number) => {
        if (!timeline || timeline.length === 0) return;
        const start = timeline[startIdx]?.startTime;
        const end = timeline[endIdx]?.endTime; // Use end of last bucket

        if (start && end) {
            const rangeStart = new Date(start).getTime();
            const rangeEnd = new Date(end).getTime();

            setFilteredEvents(events.filter(e => {
                const t = new Date(e.timestamp).getTime();
                return t >= rangeStart && t <= rangeEnd;
            }));
        }
    };

    const handleGenerateReport = (type: any) => {
        if (!summary || !timeline) throw new Error("No data");
        // Re-run generation on demand
        const ctx = {
            summary, timelineBuckets: timeline, events, topApps: summary.topApps, topDomains: summary.topDomains,
            workHoursConfig: { start: 9, end: 18 }, health: { queueDepth: 10, lastUploadAt: new Date().toISOString(), policyVersion: 'v1' }
        };
        return generateExecutiveReport(ctx, insights, deviceId || 'Device', type);
    };

    if (loading) return <div className="page-container">Loading Telemetry...</div>;
    if (!summary) return <div className="page-container" style={{ color: 'var(--danger)' }}>Failed to load data.</div>;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex-row space-between" style={{ marginBottom: '2rem' }}>
                <div className="flex-row gap-md">
                    <button className="btn-icon" onClick={() => navigate('/devices')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>Telemetry Details</h1>
                        <div style={{ color: 'var(--text-muted)', marginTop: -4 }}>
                            Deep dive analysis for device: <span style={{ fontFamily: 'monospace' }}>{deviceId}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-row gap-md">
                    <div className="flex-row gap-sm" style={{ background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <button
                            className={`btn-text ${timeRange === '24h' ? 'active' : ''}`}
                            style={timeRange === '24h' ? { background: 'var(--primary)', color: 'white' } : {}}
                            onClick={() => setTimeRange('24h')}
                        >
                            24h
                        </button>
                        <button
                            className={`btn-text ${timeRange === '7d' ? 'active' : ''}`}
                            style={timeRange === '7d' ? { background: 'var(--primary)', color: 'white' } : {}}
                            onClick={() => setTimeRange('7d')}
                        >
                            7d
                        </button>
                    </div>
                    <button className="btn-primary" onClick={() => setShowCopilot(true)}>
                        <Sparkles size={16} />
                        AI Copilot
                    </button>
                </div>
            </div>

            {/* Executive Summary */}
            <div style={{ marginBottom: '2rem' }}>
                <ExecutiveSummary summary={summary} insights={insights} managerSnapshot={managerSnapshot} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Timeline */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} />
                        Activity Timeline
                    </h3>
                    <BehaviorTimeline data={timeline} onBrushChange={handleBrushChange} />
                </div>

                {/* Insights */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert size={18} />
                        AI Insights & Anomalies
                    </h3>
                    <InsightsPanel insights={insights} />
                </div>
            </div>

            {/* Detailed Views */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <DeepDiveTabs
                    events={filteredEvents}
                    loading={loading}
                    onFilterChange={(f) => console.log('Filter:', f)}
                />
            </div>

            <AICopilotModal
                isOpen={showCopilot}
                onClose={() => setShowCopilot(false)}
                onGenerate={handleGenerateReport}
            />
        </div>
    );
};

export default TelemetryDetails;
