import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PolicyApi } from '../../api/client';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';

export default function DevicesPolicyStatus() {
    const { data: devices, isLoading } = useQuery({
        queryKey: ['deviceStatuses'],
        queryFn: PolicyApi.getDeviceStatuses,
    });

    if (isLoading) return <div className="p-8">Loading statuses...</div>;

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'APPLIED': return 'success';
            case 'FAILED': return 'destructive';
            case 'STALE': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Device Policy Status</h1>
            <Card>
                <CardHeader><CardTitle>Compliance Overview</CardTitle></CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Device Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Policy Version</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Seen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices?.map((device) => (
                                    <tr key={device.deviceId} className="border-b hover:bg-slate-50">
                                        <td className="p-4 align-middle">{device.hostname || 'Unknown'}</td>
                                        <td className="p-4 align-middle font-mono text-xs">{device.deviceId}</td>
                                        <td className="p-4 align-middle">{device.policyVersion || '-'}</td>
                                        <td className="p-4 align-middle">
                                            <Badge variant={getStatusColor(device.ackStatus)}>
                                                {device.ackStatus || 'PENDING'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle">{device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
