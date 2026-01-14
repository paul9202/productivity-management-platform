import React, { useEffect, useState } from 'react';
import { DashboardData, DashboardFilterState } from '../types/dashboard';
import { useApi } from '../api';
import { evaluateOrgRules } from '../features/dashboard/logic/ruleEngine';
import { FilterBar } from '../components/dashboard/FilterBar';
import { KpiGrid } from '../components/dashboard/KpiGrid';
import { OrgView } from '../components/dashboard/OrgView';
import { TrendChartSection } from '../components/dashboard/TrendChartSection';
import { ActionCenter } from '../components/dashboard/ActionCenter';
import { CopilotModal } from '../components/dashboard/CopilotModal';
import { Bot } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const api = useApi();
    // State
    const [data, setData] = useState<DashboardData | null>(null);
    const [filters, setFilters] = useState<DashboardFilterState>({
        timeRange: '24H',
        scopeId: 'root',
        scopeType: 'ORG',
        includeOffHours: false,
        viewMode: 'PRODUCTIVITY'
    });
    const [copilotOpen, setCopilotOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await api.getDashboardData(filters.timeRange, filters.scopeType, filters.scopeId);
            // Run Rules on the data (Client side post-processing for now)
            if (!result.topIssues || result.topIssues.length === 0) {
                result.topIssues = evaluateOrgRules(result);
            }
            setData(result);
        } catch (e) {
            console.error("Failed to load dashboard", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]); // Reload when filters change (in real app, pass filters to API)

    if (loading && !data) return <div className="page-container" style={{ textAlign: 'center', marginTop: '100px' }}>Loading Command Center...</div>;
    if (!data) return <div>Error loading data</div>;

    return (
        <div className="page-container">
            {/* Header Area */}
            <div className="flex-row space-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                <div>
                    <h1>{t('pages.dashboard.title')}</h1>
                    <div style={{ color: 'var(--text-muted)', marginTop: '-8px' }}>Real-time productivity & risk insights.</div>
                </div>
                <button
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', boxShadow: '0 4px 6px rgba(124, 58, 237, 0.2)' }}
                    onClick={() => setCopilotOpen(true)}
                >
                    <Bot size={18} />
                    AI Copilot Brief
                </button>
            </div>

            {/* Global Filters */}
            <FilterBar
                filters={filters}
                onFilterChange={(f) => setFilters({ ...filters, ...f })}
                onRefresh={loadData}
                lastUpdated={data.generatedAt}
            />

            {/* KPI Cards */}
            <KpiGrid kpis={data.kpis} viewMode={filters.viewMode} />

            {/* Main Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

                {/* Left Column: Charts & Org View (8 spans) */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <TrendChartSection data={data} />
                    <div style={{ height: '400px' }}>
                        <OrgView departments={data.departments} />
                    </div>
                </div>

                {/* Right Column: Action Center (4 spans) */}
                <div style={{ gridColumn: 'span 4' }}>
                    <ActionCenter issues={data.topIssues} />
                </div>
            </div>

            {/* AI Copilot Modal */}
            <CopilotModal
                isOpen={copilotOpen}
                onClose={() => setCopilotOpen(false)}
                data={data}
                scopeName={filters.scopeId === 'root' ? 'Organization' : filters.scopeId}
            />
        </div>
    );
};

export default Dashboard;
