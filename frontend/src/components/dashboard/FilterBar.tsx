import React from 'react';
import { DashboardFilterState } from '../../types/dashboard';
import { Calendar, Filter, Layers, RefreshCw } from 'lucide-react';

interface Props {
    filters: DashboardFilterState;
    onFilterChange: (f: Partial<DashboardFilterState>) => void;
    onRefresh: () => void;
    lastUpdated: string;
}

export const FilterBar: React.FC<Props> = ({ filters, onFilterChange, onRefresh, lastUpdated }) => {
    return (
        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex-row gap-lg">
                {/* Time Range */}
                <div className="flex-row gap-sm">
                    <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                    <select
                        className="input-field"
                        style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        value={filters.timeRange}
                        onChange={(e) => onFilterChange({ timeRange: e.target.value as any })}
                    >
                        <option value="TODAY">Today</option>
                        <option value="24H">Last 24 Hours</option>
                        <option value="7D">Last 7 Days</option>
                        <option value="30D">Last 30 Days</option>
                    </select>
                </div>

                {/* Scope */}
                <div className="flex-row gap-sm">
                    <Layers size={16} style={{ color: 'var(--text-muted)' }} />
                    <select
                        className="input-field"
                        style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        value={filters.scopeId}
                        onChange={(e) => onFilterChange({ scopeId: e.target.value })}
                    >
                        <option value="root">Entire Organization</option>
                        <option value="dept-eng">Engineering</option>
                        <option value="dept-sales">Sales</option>
                        <option value="dept-fin">Finance</option>
                    </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex-row" style={{ background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                    {['PRODUCTIVITY', 'RISK', 'HEALTH'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => onFilterChange({ viewMode: mode as any })}
                            style={{
                                border: 'none', background: filters.viewMode === mode ? 'white' : 'transparent',
                                color: filters.viewMode === mode ? 'var(--primary)' : 'var(--text-muted)',
                                padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                boxShadow: filters.viewMode === mode ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-row gap-md">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
                <button className="btn-icon" onClick={onRefresh} title="Refresh Data">
                    <RefreshCw size={16} />
                </button>
            </div>
        </div>
    );
};
