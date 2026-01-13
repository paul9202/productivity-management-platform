import React from 'react';
import { TelemetrySummary, InsightItem } from '../../types/telemetry';
import {
    Activity, Clock, AlertTriangle, ShieldAlert, Monitor,
    Wifi, WifiOff, LayoutGrid, FileText
} from 'lucide-react';

interface Props {
    summary: TelemetrySummary;
    insights: InsightItem[];
    managerSnapshot: string;
}

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; subtext?: string; color?: string }> = ({
    title, value, icon, subtext, color = 'bg-white'
}) => (
    <div className={`p-4 rounded-xl border border-gray-100 shadow-sm ${color} transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">{title}</span>
            <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
                {icon}
            </div>
        </div>
        <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subtext && <span className="text-xs text-gray-500 mb-1">{subtext}</span>}
        </div>
    </div>
);

const RiskCounter: React.FC<{ count: number; label: string; icon: any }> = ({ count, label, icon: Icon }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${count > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
        <div className={`p-1.5 rounded-md ${count > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
            <Icon size={16} />
        </div>
        <div>
            <p className={`text-lg font-bold ${count > 0 ? 'text-red-700' : 'text-gray-700'}`}>{count}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    </div>
);

export const ExecutiveSummary: React.FC<Props> = ({ summary, insights, managerSnapshot }) => {
    const activeHrs = (summary.totalActiveSeconds / 3600).toFixed(1);
    const idleHrs = (summary.totalIdleSeconds / 3600).toFixed(1);
    const riskCount = insights.filter(i => i.category === 'RISK').length; // Use calculated insights, not just raw counters

    // Status Logic
    const isOnline = summary.status.online;
    const isRisk = riskCount > 0;

    return (
        <div className="space-y-6">
            {/* Manager Snapshot Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1">
                    <LayoutGrid size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">Manager Snapshot</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        {managerSnapshot}
                    </p>
                </div>
            </div>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    title="Active Time"
                    value={`${activeHrs}h`}
                    subtext={`Score: ${summary.productivityScore}`}
                    icon={<Activity size={20} />}
                />
                <KPICard
                    title="Idle Time"
                    value={`${idleHrs}h`}
                    icon={<Clock size={20} />}
                />
                <KPICard
                    title="Risk Level"
                    value={riskCount > 0 ? 'High' : 'Low'}
                    subtext={`${riskCount} alerts`}
                    color={riskCount > 0 ? 'bg-red-50' : 'bg-white'}
                    icon={<ShieldAlert size={20} className={riskCount > 0 ? 'text-red-600' : ''} />}
                />
                <KPICard
                    title="Device Status"
                    value={isOnline ? 'Online' : 'Offline'}
                    subtext={`Last seen: ${new Date(summary.status.lastSeenAt).toLocaleTimeString()}`}
                    color={isOnline ? 'bg-green-50' : 'bg-gray-50'}
                    icon={isOnline ? <Wifi size={20} className="text-green-600" /> : <WifiOff size={20} />}
                />
            </div>

            {/* Risk Detail Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <RiskCounter label="Blocked Sites" count={summary.riskCounters.blocks} icon={ShieldAlert} />
                <RiskCounter label="Sensitive Keywords" count={summary.riskCounters.sensitiveKeywords} icon={FileText} />
                <RiskCounter label="USB Copy Events" count={summary.riskCounters.usbEvents} icon={AlertTriangle} />
                <RiskCounter label="Anomalies" count={summary.riskCounters.anomalies} icon={Monitor} />
            </div>
        </div>
    );
};
