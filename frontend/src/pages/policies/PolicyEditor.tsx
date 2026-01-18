import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PolicyApi } from '../../api/client';
import { PolicyConfig } from '../../types/policy';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';
import { Save, ArrowLeft, Upload } from 'lucide-react';


// Zod Schema
const configSchema = z.object({
    activity: z.object({
        enabled: z.boolean(),
        idle_threshold_s: z.number().min(5).max(600),
        bucket_s: z.number().default(60),
        capture_foreground_app: z.boolean(),
    }),
    usb: z.object({
        enabled: z.boolean(),
        poll_interval_s: z.number().min(1).max(10),
    }),
    file: z.object({
        enabled: z.boolean(),
        monitored_directories: z.array(z.string()), // editable list
        debounce_ms: z.number().min(500).max(10000),
        ops: z.array(z.enum(['create', 'modify', 'delete', 'rename', 'copy'])),
    }),
    camera: z.object({
        enabled: z.boolean(),
        fps: z.number().min(1).max(10),
        weight: z.number().min(0).max(1),
        fail_open: z.boolean(),
    }),
    detections: z.object({
        r1_usb_exfil: z.object({
            enabled: z.boolean(),
            window_minutes: z.number().default(10),
        }),
        r2_mass_delete: z.object({
            enabled: z.boolean(),
            window_minutes: z.number().default(5),
            threshold_count: z.number().default(30),
        }),
    }),
});

const defaultConfig: PolicyConfig = {
    activity: { enabled: true, idle_threshold_s: 30, bucket_s: 60, capture_foreground_app: true },
    usb: { enabled: true, poll_interval_s: 2 },
    file: { enabled: true, monitored_directories: ["C:\\Users\\Public", "D:\\Work"], debounce_ms: 1000, ops: ['create', 'modify', 'delete', 'rename'] },
    camera: { enabled: false, fps: 1, weight: 0.5, fail_open: true },
    detections: {
        r1_usb_exfil: { enabled: true, window_minutes: 10 },
        r2_mass_delete: { enabled: true, window_minutes: 5, threshold_count: 30 }
    }
};

export default function PolicyEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: policy, isLoading } = useQuery({
        queryKey: ['policy', id],
        queryFn: () => PolicyApi.getPolicy(id!),
        enabled: !!id,
    });

    const form = useForm<PolicyConfig>({
        resolver: zodResolver(configSchema),
        defaultValues: defaultConfig,
    });

    useEffect(() => {
        if (policy?.configDraft) {
            try {
                const parsed = JSON.parse(policy.configDraft);
                form.reset(parsed);
            } catch (e) {
                console.error("Failed to parse draft config", e);
            }
        }
    }, [policy, form]);

    const saveMutation = useMutation({
        mutationFn: (data: PolicyConfig) => PolicyApi.updateDraft(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policy', id] });
            alert("Draft saved successfully.");
        },
        onError: (e) => alert("Failed to save draft: " + e)
    });

    const publishMutation = useMutation({
        mutationFn: () => PolicyApi.publish(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policy', id] });
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            alert("Policy published!");
            navigate('/policies');
        }
    });

    const onSave = (data: PolicyConfig) => {
        saveMutation.mutate(data);
    };

    if (isLoading) return <div className="p-8">Loading editor...</div>;
    if (!policy) return <div className="p-8">Policy not found.</div>;

    const SectionHeader = ({ title, enabledPath }: { title: string, enabledPath: any }) => (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{title}</h3>
            <Controller
                control={form.control}
                name={enabledPath}
                render={({ field }) => (
                    <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
                        <span>Enabled</span>
                    </label>
                )}
            />
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/policies')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{policy.name}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={policy.status === 'PUBLISHED' ? 'success' : 'secondary'}>{policy.status}</Badge>
                            <span className="text-sm text-slate-500">v{policy.publishedVersion || 0}</span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={form.handleSubmit(onSave)} disabled={saveMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button onClick={() => { if (confirm("Publish config version?")) publishMutation.mutate() }}>
                        <Upload className="w-4 h-4 mr-2" />
                        Publish
                    </Button>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">

                {/* Activity */}
                <Card>
                    <CardHeader><CardTitle>Activity Monitoring</CardTitle></CardHeader>
                    <CardContent>
                        <SectionHeader title="Settings" enabledPath="activity.enabled" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Idle Threshold (sec)</label>
                                <Input type="number" {...form.register("activity.idle_threshold_s", { valueAsNumber: true })} />
                                {form.formState.errors.activity?.idle_threshold_s && <p className="text-red-500 text-xs">{form.formState.errors.activity.idle_threshold_s.message}</p>}
                            </div>
                            <div>
                                <label className="flex items-center space-x-2 mt-6">
                                    <input type="checkbox" {...form.register("activity.capture_foreground_app")} className="h-4 w-4" />
                                    <span className="text-sm">Capture Foreground App</span>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* USB */}
                <Card>
                    <CardHeader><CardTitle>USB Monitoring</CardTitle></CardHeader>
                    <CardContent>
                        <SectionHeader title="Settings" enabledPath="usb.enabled" />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Poll Interval (sec)</label>
                                <Input type="number" {...form.register("usb.poll_interval_s", { valueAsNumber: true })} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* File */}
                <Card>
                    <CardHeader><CardTitle>File Operations</CardTitle></CardHeader>
                    <CardContent>
                        <SectionHeader title="Settings" enabledPath="file.enabled" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Monitored Directories (comma separated)</label>
                                <Controller
                                    control={form.control}
                                    name="file.monitored_directories"
                                    render={({ field }) => (
                                        <Input
                                            value={field.value?.join(', ')}
                                            onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                        />
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Debounce (ms)</label>
                                    <Input type="number" {...form.register("file.debounce_ms", { valueAsNumber: true })} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Rules */}
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader><CardTitle>Risk Detections</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="border p-4 rounded bg-slate-50">
                                <SectionHeader title="R1: USB Exfiltration" enabledPath="detections.r1_usb_exfil.enabled" />
                                <p className="text-sm text-slate-500 mb-2">Detects file copies/modifications to external drives shortly after insertion.</p>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Window (minutes)</label>
                                    <Input type="number" className="w-32" {...form.register("detections.r1_usb_exfil.window_minutes", { valueAsNumber: true })} />
                                </div>
                            </div>
                            <div className="border p-4 rounded bg-slate-50">
                                <SectionHeader title="R2: Mass Delete/Rename" enabledPath="detections.r2_mass_delete.enabled" />
                                <p className="text-sm text-slate-500 mb-2">Detects high volume of file deletions or renames.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Window (minutes)</label>
                                        <Input type="number" {...form.register("detections.r2_mass_delete.window_minutes", { valueAsNumber: true })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Threshold Count</label>
                                        <Input type="number" {...form.register("detections.r2_mass_delete.threshold_count", { valueAsNumber: true })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </form>
        </div>
    );
}
