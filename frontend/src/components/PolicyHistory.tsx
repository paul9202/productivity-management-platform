import React, { useEffect, useState } from 'react';
import { PolicyVersion, PolicyAck } from '../types';
import { useApi } from '../api';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight, Server } from 'lucide-react';

interface PolicyHistoryProps {
    policyId: string;
}

const PolicyHistory: React.FC<PolicyHistoryProps> = ({ policyId }) => {
    const api = useApi();
    const [versions, setVersions] = useState<PolicyVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
    const [acks, setAcks] = useState<PolicyAck[]>([]);
    const [loadingAcks, setLoadingAcks] = useState(false);

    useEffect(() => {
        loadVersions();
    }, [policyId]);

    const loadVersions = async () => {
        try {
            const list = await api.listPolicyVersions(policyId);
            setVersions(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleVersion = async (versionId: string) => {
        if (expandedVersionId === versionId) {
            setExpandedVersionId(null);
            return;
        }

        setExpandedVersionId(versionId);
        setLoadingAcks(true);
        try {
            const ackList = await api.listPolicyAcks(policyId, versionId);
            setAcks(ackList);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAcks(false);
        }
    };

    if (loading) return <div className="p-4">Loading history...</div>;

    if (versions.length === 0) {
        return <div className="p-4 text-muted">No versions found. Publish a policy to see history.</div>;
    }

    return (
        <div className="policy-history">
            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Version History & Deployment Status</h3>
            <div className="version-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {versions.map(v => (
                    <div key={v.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div
                            className="flex-row space-between"
                            style={{ padding: '12px 16px', background: 'var(--bg-surface-hover)', cursor: 'pointer' }}
                            onClick={() => toggleVersion(v.id)}
                        >
                            <div className="flex-row gap-sm">
                                {expandedVersionId === v.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                <span style={{ fontWeight: 600 }}>Version {v.version}</span>
                                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    {new Date(v.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex-row gap-xs">
                                <Clock size={14} className="text-muted" />
                            </div>
                        </div>

                        {expandedVersionId === v.id && (
                            <div style={{ padding: 16, borderTop: '1px solid var(--border-subtle)' }}>
                                <h4 style={{ fontSize: '0.875rem', marginBottom: 12 }}>Device Status</h4>
                                {loadingAcks ? (
                                    <div>Loading status...</div>
                                ) : acks.length === 0 ? (
                                    <div className="text-muted">No devices have reported status for this version yet.</div>
                                ) : (
                                    <table className="data-table" style={{ fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Device ID</th>
                                                <th>Status</th>
                                                <th>Sync Time</th>
                                                <th>Message</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {acks.map(ack => (
                                                <tr key={ack.id}>
                                                    <td>
                                                        <div className="flex-row gap-xs">
                                                            <Server size={14} /> {ack.deviceId}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={ack.status} />
                                                    </td>
                                                    <td>{ack.acknowledgedAt ? new Date(ack.acknowledgedAt).toLocaleString() : '-'}</td>
                                                    <td>{ack.message || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ fontSize: '0.875rem', marginBottom: 8 }}>Configuration</h4>
                                    <pre style={{
                                        background: 'black',
                                        color: '#0f0',
                                        padding: 12,
                                        borderRadius: 8,
                                        fontSize: '0.75rem',
                                        overflowX: 'auto'
                                    }}>
                                        {JSON.stringify(JSON.parse(v.configuration), null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let color = 'gray';
    let Icon = AlertCircle;

    if (status === 'APPLIED') {
        color = 'var(--success)';
        Icon = CheckCircle;
    } else if (status === 'FAILED') {
        color = 'var(--error)';
        Icon = XCircle;
    } else if (status === 'PENDING') {
        color = 'var(--warning)';
        Icon = Clock;
    }

    return (
        <span style={{
            color,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 500,
            background: `color-mix(in srgb, ${color} 10%, transparent)`,
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: '0.75rem'
        }}>
            <Icon size={12} />
            {status}
        </span>
    );
};

export default PolicyHistory;
