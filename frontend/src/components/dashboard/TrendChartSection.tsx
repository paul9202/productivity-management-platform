import React from 'react';
import { DashboardData } from '../../types/dashboard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
    data: DashboardData;
}

export const TrendChartSection: React.FC<Props> = ({ data }) => {
    return (
        <div className="card" style={{ height: '350px' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Productivity vs Risk Trend (7D)</h3>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data.trends.daily}>
                    <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="active" stroke="#4f46e5" fillOpacity={1} fill="url(#colorActive)" name="Active Min" />
                    <Area type="monotone" dataKey="risk" stroke="#dc2626" fillOpacity={0} name="Risk Events" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
