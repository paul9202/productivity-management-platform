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
import { Bot, RefreshCw, ArrowLeft, Download } from 'lucide-react';

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
    const [isCopilotOpen, setIsCopilotOpen] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState<TelemetryEvent[]>([]);

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
                health: { queueDepth: 120, lastUploadAt: new Date().toISOString(), policyVersion: 'v1' }
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
    const handleBrush = (startIdx: number, endIdx: number) => {
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

    if (loading) return <div className="p-10 flex justify-center text-gray-500">Loading Telemetry...</div>;
    if (!summary) return <div className="p-10 text-red-500">Failed to load data.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {summary.deviceId}
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-500 font-mono">
                                {summary.status.agentVersion}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500">Last seen: {new Date(summary.status.lastSeenAt).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => setIsCopilotOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Bot size={18} />
                        AI Copilot
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6">

                {/* Left Column: Stats & Timeline (9 cols) */}
                <div className="col-span-12 xl:col-span-9 space-y-6">
                    <ExecutiveSummary
                        summary={summary}
                        insights={insights}
                        managerSnapshot={managerSnapshot}
                    />

                    <BehaviorTimeline
                        data={timeline}
                        onBrushChange={handleBrush}
                    />

                    <DeepDiveTabs events={filteredEvents} />
                </div>

                {/* Right Column: Insights Panel (3 cols) */}
                <div className="col-span-12 xl:col-span-3">
                    <div className="sticky top-24">
                        <InsightsPanel insights={insights} />

                        {/* Quick Tips or Agent Health could go here */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Agent Health</h4>
                            <div className="flex justify-between text-sm text-blue-900 mb-1">
                                <span>Queue Depth</span>
                                <span className="font-mono">12 events</span>
                            </div>
                            <div className="flex justify-between text-sm text-blue-900">
                                <span>Policy Ver</span>
                                <span className="font-mono">{summary.status.policyVersion}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AICopilotModal
                isOpen={isCopilotOpen}
                onClose={() => setIsCopilotOpen(false)}
                onGenerate={handleGenerateReport}
            />
        </div>
    );
};

export default TelemetryDetails;
