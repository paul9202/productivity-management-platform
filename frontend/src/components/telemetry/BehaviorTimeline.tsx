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
            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-xs">
                <p className="font-bold mb-1">{new Date(data.startTime).toLocaleTimeString()}</p>
                <div className="space-y-1">
                    <p className="text-green-600">Active: {(data.activeSeconds / 60).toFixed(0)}m</p>
                    <p className="text-yellow-600">Idle: {(data.idleSeconds / 60).toFixed(0)}m</p>
                    <hr className="my-1" />
                    <p>Top App: <span className="font-medium">{data.topApp}</span></p>
                    <p>Top Site: <span className="font-medium">{data.topDomain}</span></p>
                    {data.eventCounts.file > 0 && <p className="text-red-500 font-bold">Files: {data.eventCounts.file}</p>}
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
        <div className="h-[350px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Activity Timeline (24h)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <ComposedChart data={chartData} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="displayTime" minTickGap={30} tick={{ fontSize: 10 }} />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />

                    <Bar dataKey="activeMin" name="Active" stackId="a" fill="#10B981" barSize={8} />
                    <Bar dataKey="idleMin" name="Idle" stackId="a" fill="#F59E0B" barSize={8} />

                    {/* Brush for selecting range */}
                    <Brush
                        dataKey="startTime"
                        height={30}
                        stroke="#8884d8"
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
