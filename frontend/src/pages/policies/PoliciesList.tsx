import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PolicyApi } from '../../api/client';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input } from '../../components/ui';
import { Plus, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PoliciesList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: policies, isLoading, isError } = useQuery({
        queryKey: ['policies'],
        queryFn: PolicyApi.listPolicies,
    });

    // Create mutation (simple one for now)
    const createMutation = useMutation({
        mutationFn: async (name: string) => PolicyApi.createPolicy(name, "New Policy"),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policies'] }),
    });

    const [newPolicyName, setNewPolicyName] = useState("");

    if (isLoading) return <div className="p-8">Loading policies...</div>;
    if (isError) return <div className="p-8 text-red-500">Failed to load policies.</div>;

    const handleCreate = () => {
        if (!newPolicyName) return;
        createMutation.mutate(newPolicyName);
        setNewPolicyName("");
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="New Policy Name"
                        value={newPolicyName}
                        onChange={(e) => setNewPolicyName(e.target.value)}
                        className="w-64"
                    />
                    <Button onClick={handleCreate} disabled={!newPolicyName || createMutation.isPending}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Policy Packs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Version</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Updated</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {policies?.map((policy) => (
                                    <tr key={policy.id} className="border-b transition-colors hover:bg-slate-50">
                                        <td className="p-4 align-middle font-medium">{policy.name}</td>
                                        <td className="p-4 align-middle">
                                            <Badge variant={policy.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                                                {policy.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle">v{policy.publishedVersion || 0}</td>
                                        <td className="p-4 align-middle">{new Date(policy.updatedAt || policy.createdAt).toLocaleString()}</td>
                                        <td className="p-4 align-middle text-right gap-2 flex justify-end">
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/policies/${policy.id}`)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Editor
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/policies/${policy.id}/assignments`)}>
                                                Assignments
                                            </Button>
                                        </td>
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
