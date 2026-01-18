import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { PolicyApi } from '../../api/client';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

export default function Assignments() {
    const { id } = useParams<{ id: string }>();
    const [selectedPolicyId, setSelectedPolicyId] = useState(id || "");
    const [deviceIds, setDeviceIds] = useState("");

    useEffect(() => {
        if (id) setSelectedPolicyId(id);
    }, [id]);

    const { data: policies } = useQuery({
        queryKey: ['policies'],
        queryFn: PolicyApi.listPolicies,
    });

    const assignMutation = useMutation({
        mutationFn: async () => {
            const devices = deviceIds.split('\n').map(s => s.trim()).filter(Boolean);
            for (const d of devices) {
                await PolicyApi.assignPolicy(d, selectedPolicyId);
            }
        },
        onSuccess: () => {
            alert("Assignments submitted.");
            setDeviceIds("");
        }
    });

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Policy Assignments</h1>
            <Card>
                <CardHeader><CardTitle>Assign Policy to Devices</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Policy</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedPolicyId}
                            onChange={(e) => setSelectedPolicyId(e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            {policies?.filter(p => p.status === 'PUBLISHED').map(p => (
                                <option key={p.id} value={p.id}>{p.name} (v{p.publishedVersion})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Device IDs (one per line)</label>
                        <textarea
                            className="w-full p-2 border rounded h-32"
                            value={deviceIds}
                            onChange={(e) => setDeviceIds(e.target.value)}
                            placeholder="device-urn-1&#10;device-urn-2"
                        />
                    </div>
                    <Button
                        onClick={() => assignMutation.mutate()}
                        disabled={!selectedPolicyId || !deviceIds || assignMutation.isPending}
                    >
                        {assignMutation.isPending ? 'Assigning...' : 'Assign Policies'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
