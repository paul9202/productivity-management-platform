import React from 'react';
import {
    ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush
} from 'recharts';
import { TimelineBucket } from '../../types/telemetry';

interface Props {
    data: TimelineBucket[];
    onBrushChange?: (startIndex: number, endIndex: number) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as TimelineBucket;
        return (
            <div style={{ background: '#fff', padding: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{new Date(data.startTime).toLocaleTimeString()}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <p style={{ color: '#16a34a' }}>Active: {(data.activeSeconds / 60).toFixed(0)}m</p>
                    <p style={{ color: '#ca8a04' }}>Idle: {(data.idleSeconds / 60).toFixed(0)}m</p>
                    <hr style={{ margin: '0.25rem 0', borderColor: '#e2e8f0' }} />
                    <p>Top App: <span style={{ fontWeight: 500 }}>{data.topApp}</span></p>
                    <p>Top Site: <span style={{ fontWeight: 500 }}>{data.topDomain}</span></p>
                    {data.eventCounts?.file > 0 && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>Files: {data.eventCounts.file}</p>}
                </div>
            </div>
        );
    }
    return null;
};

export const BehaviorTimeline: React.FC<Props> = ({ data, onBrushChange }) => {
    // Transform seconds to minutes for better visualization
    const chartData = data.map(d => ({
        ...d,
        activeMin: d.activeSeconds / 60,
        idleMin: d.idleSeconds / 60,
        lockedMin: d.lockedSeconds / 60,
        displayTime: new Date(d.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return (
        <div style={{ height: '350px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="90%">
                <ComposedChart data={chartData} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="displayTime" minTickGap={30} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />

                    <Bar dataKey="activeMin" name="Active" stackId="a" fill="#3b82f6" barSize={8} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="idleMin" name="Idle" stackId="a" fill="#eab308" barSize={8} />

                    {/* Brush for selecting range */}
                    <Brush
                        dataKey="startTime"
                        height={30}
                        stroke="#94a3b8"
                        onChange={(e: any) => {
                            if (onBrushChange && e.startIndex !== undefined) {
                                onBrushChange(e.startIndex, e.endIndex);
                            }
                        }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
