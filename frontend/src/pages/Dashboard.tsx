import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { DashboardSummary } from '../types';
import { KpiCard } from '../components/KpiCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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

    if (loading || !data) return <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', animation: 'spin 1s linear infinite' }}></div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>;

    return (
        <div className="page-container">
            <div className="flex-row space-between" style={{ marginBottom: 32 }}>
                <div>
                    <h1>Executive Overview</h1>
                    <div style={{ color: 'var(--text-muted)', marginTop: -16 }}>Real-time productivity insights across the organization.</div>
                </div>
                <div className="flex-row gap-sm">
                    <button className="btn-text">Last 7 Days</button>
                    <button className="btn-primary">Export Report</button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="flex-row gap-lg" style={{ marginBottom: 32, alignItems: 'stretch' }}>
                <KpiCard title="Avg Focus Score" value={data.avgFocusScore} trend={{ value: 2.5, label: 'vs last week' }} />
                <KpiCard title="Total Active Hours" value={data.totalActiveHours} trend={{ value: 12, label: 'increase' }} />
                <KpiCard title="Off-Task Ratio" value={`${data.offTaskRatio}%`} color={data.offTaskRatio > 15 ? 'var(--warning)' : 'var(--success)'} trend={{ value: -5, label: 'improvement' }} />
                <KpiCard title="Active Alerts" value={data.alertsToday} color={data.alertsToday > 0 ? 'var(--error)' : 'var(--text-muted)'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                {/* Main Chart Section */}
                <div className="card">
                    <div className="flex-row space-between" style={{ marginBottom: 24 }}>
                        <h3>Focus Trend</h3>
                        <select style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                            <option>Focus Score</option>
                            <option>Active Time</option>
                        </select>
                    </div>
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.trendLast7Days}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Blocked Domains */}
                <div className="card">
                    <h3>Top Security Risks</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>Domains with highest blockage triggers.</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {data.topBlockedDomains.map(d => (
                            <div key={d.domain} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--bg-body)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>!</div>
                                    <span style={{ fontWeight: 500 }}>{d.domain}</span>
                                </div>
                                <span className="badge badge-error">{d.attempts} attempts</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn-text" style={{ width: '100%', marginTop: 16 }}>View All Alerts</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
