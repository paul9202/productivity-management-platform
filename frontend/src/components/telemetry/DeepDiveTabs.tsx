import React, { useState } from 'react';
import {
    TelemetryEvent, AppEvent, WebEvent, FileEvent, ImEvent, BlockEvent
} from '../../types/telemetry';
import { File, Globe, AppWindow, MessageSquare, Shield, Filter } from 'lucide-react';

interface Props {
    events: TelemetryEvent[];
}

export const DeepDiveTabs: React.FC<Props> = ({ events }) => {
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
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
            {/* Tabs Header */}
            <div className="flex justify-between items-center border-b border-gray-100 px-4">
                <div className="flex gap-2">
                    <TabButton id="APPS" label="Apps" icon={AppWindow} />
                    <TabButton id="WEB" label="Web" icon={Globe} />
                    <TabButton id="FILES" label="Files" icon={File} />
                    <TabButton id="IM" label="Messages" icon={MessageSquare} />
                    <TabButton id="BLOCKS" label="Blocks" icon={Shield} />
                </div>
                {/* Search */}
                <div className="relative">
                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Filter..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {/* Table Content */}
            <div className="p-0 overflow-auto max-h-[500px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Time</th>
                            {activeTab === 'APPS' && <>
                                <th className="px-6 py-3">Application</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3 text-right">Duration</th>
                            </>}
                            {activeTab === 'WEB' && <>
                                <th className="px-6 py-3">Domain</th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                            </>}
                            {activeTab === 'FILES' && <>
                                <th className="px-6 py-3">Operation</th>
                                <th className="px-6 py-3">File Path</th>
                                <th className="px-6 py-3">Details</th>
                            </>}
                            {activeTab === 'IM' && <>
                                <th className="px-6 py-3">Platform</th>
                                <th className="px-6 py-3">Keyword Hit</th>
                                <th className="px-6 py-3">Snippet</th>
                            </>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {displayEvents.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-400">No events found</td></tr>
                        ) : displayEvents.map((e) => {
                            const date = new Date(e.timestamp).toLocaleTimeString();
                            return (
                                <tr key={e.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{date}</td>

                                    {activeTab === 'APPS' && (() => {
                                        const md = (e as AppEvent).metadata;
                                        return <>
                                            <td className="px-6 py-3 font-medium text-gray-900">{md.appName}</td>
                                            <td className="px-6 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{md.category}</span></td>
                                            <td className="px-6 py-3 text-right text-gray-500">{md.durationSeconds}s</td>
                                        </>;
                                    })()}

                                    {activeTab === 'WEB' && (() => {
                                        const md = (e as WebEvent).metadata;
                                        return <>
                                            <td className="px-6 py-3 text-blue-600 truncate max-w-[200px]">{md.domain}</td>
                                            <td className="px-6 py-3 text-gray-600 truncate max-w-[300px]">{md.title}</td>
                                            <td className="px-6 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{md.category}</span></td>
                                        </>;
                                    })()}

                                    {activeTab === 'FILES' && (() => {
                                        const md = (e as FileEvent).metadata;
                                        return <>
                                            <td className={`px-6 py-3 font-bold ${md.operation === 'COPY' ? 'text-blue-600' : 'text-gray-700'}`}>{md.operation}</td>
                                            <td className="px-6 py-3 text-gray-600 font-mono text-xs truncate max-w-[300px]">{md.filePath}</td>
                                            <td className="px-6 py-3 text-xs text-gray-500">
                                                {md.isUsb && <span className="text-red-600 font-bold mr-2">USB</span>}
                                                {(md.fileSize / 1024 / 1024).toFixed(1)} MB
                                            </td>
                                        </>;
                                    })()}

                                    {activeTab === 'IM' && (() => {
                                        const md = (e as ImEvent).metadata;
                                        return <>
                                            <td className="px-6 py-3 font-medium">{md.platform}</td>
                                            <td className="px-6 py-3 text-red-600 font-bold">{md.keywordHit || '-'}</td>
                                            <td className="px-6 py-3 text-gray-500 italic truncate max-w-[300px]">"{md.snippet}"</td>
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
