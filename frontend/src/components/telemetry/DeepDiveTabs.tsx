import React, { useState } from 'react';
import {
    TelemetryEvent, AppEvent, WebEvent, FileEvent, ImEvent, BlockEvent
} from '../../types/telemetry';
import { File, Globe, AppWindow, MessageSquare, Shield, Filter } from 'lucide-react';

interface Props {
    events: TelemetryEvent[];
    loading?: boolean;
    onFilterChange: (filter: any) => void;
}

export const DeepDiveTabs: React.FC<Props> = ({ events, loading }) => {
    const [activeTab, setActiveTab] = useState<'APPS' | 'WEB' | 'FILES' | 'IM' | 'BLOCKS'>('APPS');
    const [filter, setFilter] = useState('');

    // Filter events by tab
    const filteredEvents = events.filter(e => {
        if (activeTab === 'APPS') return e.type === 'APP';
        if (activeTab === 'WEB') return e.type === 'WEB';
        if (activeTab === 'FILES') return e.type === 'FILE';
        if (activeTab === 'IM') return e.type === 'IM';
        if (activeTab === 'BLOCKS') return e.type === 'BLOCK';
        return false;
    });

    // Apply text filter
    const displayEvents = filteredEvents.filter(e =>
        JSON.stringify(e.metadata).toLowerCase().includes(filter.toLowerCase())
    );

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 500,
                border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: activeTab === id ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)'
            }}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div>
            {/* Tabs Header */}
            <div className="flex-row space-between" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '0 1rem' }}>
                <div className="flex-row gap-sm">
                    <TabButton id="APPS" label="Apps" icon={AppWindow} />
                    <TabButton id="WEB" label="Web" icon={Globe} />
                    <TabButton id="FILES" label="Files" icon={File} />
                    <TabButton id="IM" label="Messages" icon={MessageSquare} />
                    <TabButton id="BLOCKS" label="Blocks" icon={Shield} />
                </div>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Filter..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', width: '200px', fontSize: '0.85rem' }}
                    />
                </div>
            </div>

            {/* Table Content */}
            <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                <table style={{ margin: 0 }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <th>Time</th>
                            {activeTab === 'APPS' && <>
                                <th>Application</th>
                                <th>Category</th>
                                <th style={{ textAlign: 'right' }}>Duration</th>
                            </>}
                            {activeTab === 'WEB' && <>
                                <th>Domain</th>
                                <th>Title</th>
                                <th>Category</th>
                            </>}
                            {activeTab === 'FILES' && <>
                                <th>Operation</th>
                                <th>File Path</th>
                                <th>Details</th>
                            </>}
                            {activeTab === 'IM' && <>
                                <th>Platform</th>
                                <th>Keyword Hit</th>
                                <th>Snippet</th>
                            </>}
                        </tr>
                    </thead>
                    <tbody>
                        {displayEvents.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No events found</td></tr>
                        ) : displayEvents.map((e) => {
                            const date = new Date(e.timestamp).toLocaleTimeString();
                            return (
                                <tr key={e.id}>
                                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{date}</td>

                                    {activeTab === 'APPS' && (() => {
                                        const md = (e as AppEvent).metadata;
                                        return <>
                                            <td style={{ fontWeight: 500 }}>{md.appName}</td>
                                            <td><span className="badge badge-neutral">{md.category}</span></td>
                                            <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{md.durationSeconds}s</td>
                                        </>;
                                    })()}

                                    {activeTab === 'WEB' && (() => {
                                        const md = (e as WebEvent).metadata;
                                        return <>
                                            <td style={{ color: 'var(--primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{md.domain}</td>
                                            <td style={{ color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{md.title}</td>
                                            <td><span className="badge badge-neutral">{md.category}</span></td>
                                        </>;
                                    })()}

                                    {activeTab === 'FILES' && (() => {
                                        const md = (e as FileEvent).metadata;
                                        return <>
                                            <td style={{ fontWeight: 'bold', color: md.operation === 'COPY' ? 'var(--primary)' : 'inherit' }}>{md.operation}</td>
                                            <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{md.filePath}</td>
                                            <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {md.isUsb && <span className="badge badge-danger" style={{ marginRight: '0.5rem' }}>USB</span>}
                                                {(md.fileSize / 1024 / 1024).toFixed(1)} MB
                                            </td>
                                        </>;
                                    })()}

                                    {activeTab === 'IM' && (() => {
                                        const md = (e as ImEvent).metadata;
                                        return <>
                                            <td style={{ fontWeight: 500 }}>{md.platform}</td>
                                            <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{md.keywordHit || '-'}</td>
                                            <td style={{ color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{md.snippet}"</td>
                                        </>;
                                    })()}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
