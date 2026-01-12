import React, { useEffect, useState } from 'react';
import { useApi } from '../api';
import { PolicySettings } from '../types';

const Policies: React.FC = () => {
    const api = useApi();
    const [policy, setPolicy] = useState<PolicySettings | null>(null);

    useEffect(() => {
        api.getPolicies().then(setPolicy);
    }, []);

    if (!policy) return <div className="page-container">Loading...</div>;

    return (
        <div className="page-container">
            <h1>Global Policies</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="card">
                    <h3>Productivity Thresholds</h3>
                    <div style={{ marginTop: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Idle Timeout (Minutes)</label>
                        <input type="number" defaultValue={policy.idleThresholdMinutes} style={{ padding: 8, width: '100%', marginBottom: 16 }} />

                        <label style={{ display: 'block', marginBottom: 8 }}>Off-Task Threshold (Minutes)</label>
                        <input type="number" defaultValue={policy.offTaskThresholdMinutes} style={{ padding: 8, width: '100%' }} />
                    </div>
                </div>

                <div className="card">
                    <h3>App & Site Rules</h3>
                    <div style={{ marginTop: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Blocked Sites (Blacklist)</label>
                        <textarea defaultValue={policy.blacklistedSites.join(', ')} style={{ width: '100%', height: 100, padding: 8 }} />
                    </div>
                </div>
            </div>
            <div style={{ marginTop: 24 }}>
                <button style={{ padding: '12px 24px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 4 }}>
                    Save Policy Changes
                </button>
            </div>
        </div>
    );
};

export default Policies;
