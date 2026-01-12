import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { DashboardSummary } from '../types';
import { KpiCard } from '../components/KpiCard';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';

const Dashboard: React.FC = () => {
    const api = useApi();
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDashboardSummary().then(res => {
            setData(res);
            setLoading(false);
        });
    }, []);

    if (loading || !data) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <h1 style={{ marginBottom: 24 }}>Executive Dashboard</h1>

            {/* KPI Grid */}
            <div className="flex-row gap-md" style={{ marginBottom: 32 }}>
                <KpiCard title="Avg Focus Score" value={data.avgFocusScore} trend={{ value: 2.5, label: 'vs last week' }} />
                <KpiCard title="Total Active Hours" value={data.totalActiveHours} />
                <KpiCard title="Off-Task Ratio" value={`${data.offTaskRatio}%`} color={data.offTaskRatio > 15 ? 'var(--warning-color)' : 'var(--success-color)'} />
                <KpiCard title="Active Alerts" value={data.alertsToday} color={data.alertsToday > 0 ? 'var(--error-color)' : 'var(--text-secondary)'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Main Chart Section */}
                <div className="card">
                    <h3>Focus Trend (7 Days)</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.trendLast7Days}>
                                <XAxis dataKey="date" />
                                <Tooltip />
                                <Line type="monotone" dataKey="score" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Blocked Domains */}
                <div className="card">
                    <h3>Top Risks</h3>
                    <table style={{ marginTop: 16 }}>
                        <thead>
                            <tr>
                                <th>Domain</th>
                                <th>Attempts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topBlockedDomains.map(d => (
                                <tr key={d.domain}>
                                    <td>{d.domain}</td>
                                    <td style={{ color: 'var(--error-color)', fontWeight: 'bold' }}>{d.attempts}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
