export interface PolicyPack {
    id: string;
    tenantId: string;
    orgId: string;
    name: string;
    description?: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    publishedVersion: number;
    configDraft: string; // JSON string
    createdAt: number;
    updatedAt: number;
}

export interface PolicySnapshot {
    policyId: string;
    version: number;
    snapshotJson: string;
    etag: string;
    issuedAtMs: number;
    expiresAtMs: number;
}

export interface PolicyAssignment {
    id: string;
    deviceId: string;
    policyId: string;
    active: boolean;
    createdAt: number;
}

export interface DevicePolicyAck {
    deviceId: string;
    policyId: string;
    version: number;
    status: 'APPLIED' | 'FAILED' | 'STALE';
    reason?: string;
    appliedAtMs: number;
    agentVersion: string;
    clientEtag: string;
}

export interface DeviceStatusSummary {
    deviceId: string;
    policyId?: string;
    policyVersion?: number;
    ackStatus?: 'APPLIED' | 'FAILED' | 'STALE';
    lastAckTime?: number;
    agentVersion?: string;
    lastHeartbeat?: string;
    hostname?: string;
    lastSeenAt?: string;
}

// Config Types for the Editor
export interface PolicyConfig {
    activity: {
        enabled: boolean;
        idle_threshold_s: number;
        bucket_s: number;
        capture_foreground_app: boolean;
    };
    usb: {
        enabled: boolean;
        poll_interval_s: number;
    };
    file: {
        enabled: boolean;
        monitored_directories: string[];
        debounce_ms: number;
        ops: ('create' | 'modify' | 'delete' | 'rename' | 'copy')[];
    };
    camera: {
        enabled: boolean;
        fps: number;
        weight: number;
        fail_open: boolean;
    };
    detections: {
        r1_usb_exfil: {
            enabled: boolean;
            window_minutes: number;
        };
        r2_mass_delete: {
            enabled: boolean;
            window_minutes: number;
            threshold_count: number;
        }
    }
}
