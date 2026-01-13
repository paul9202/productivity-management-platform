import React from 'react';
import { InsightItem } from '../../types/telemetry';
import { AlertOctagon, AlertTriangle, Info, ChevronRight } from 'lucide-react';

interface Props {
    insights: InsightItem[];
}

const InsightCard: React.FC<{ item: InsightItem }> = ({ item }) => {
    const isP1 = item.severity === 'P1';
    const isP2 = item.severity === 'P2';

    return (
        <div className={`p-3 rounded-lg border-l-4 mb-3 transition-colors hover:bg-gray-50
            ${isP1 ? 'border-red-500 bg-red-50/50' :
                isP2 ? 'border-orange-400 bg-orange-50/30' : 'border-blue-400 bg-blue-50/30'}`}>

            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    {isP1 ? <AlertOctagon size={16} className="text-red-600" /> :
                        isP2 ? <AlertTriangle size={16} className="text-orange-600" /> :
                            <Info size={16} className="text-blue-600" />}
                    <span className="font-bold text-sm text-gray-800">{item.title}</span>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold
                    ${isP1 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.severity}
                </span>
            </div>

            <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                {item.evidenceSummary}
            </p>

            <div className="flex justify-between items-end">
                <div className="text-[10px] text-gray-400">
                    Conf: {item.confidence}% • ID: {item.ruleId}
                </div>
                <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Details <ChevronRight size={10} />
                </button>
            </div>
        </div>
    );
};

export const InsightsPanel: React.FC<Props> = ({ insights }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    AI Insights
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {insights.length} Found
                </span>
            </div>

            <div className="p-4 overflow-y-auto flex-1 max-h-[600px] scrollbar-thin">
                {insights.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p className="text-sm">No significant patterns detected.</p>
                    </div>
                ) : (
                    insights.map(i => <InsightCard key={i.id} item={i} />)
                )}
            </div>
        </div>
    );
};
