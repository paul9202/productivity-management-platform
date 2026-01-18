import { PolicyPack, PolicySnapshot, PolicyConfig, DeviceStatusSummary } from '../types/policy';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    if (!res.ok) {
        throw new Error(`API Error ${res.status}: ${await res.text()}`);
    }
    // Handle 204 No Content
    if (res.status === 204) {
        return {} as T;
    }
    return res.json();
}

export const PolicyApi = {
    // Policy Management
    listPolicies: () => fetchJson<PolicyPack[]>('/admin/policies'),

    createPolicy: (name: string, description: string) =>
        fetchJson<PolicyPack>('/admin/policies', {
            method: 'POST',
            body: JSON.stringify({ name, description }),
        }),

    getPolicy: (id: string) => fetchJson<PolicyPack>(`/admin/policies/${id}`), // Assuming generic GET exists or we strictly use list for now

    updateDraft: (id: string, config: PolicyConfig) =>
        fetchJson<PolicyPack>(`/admin/policies/${id}/draft`, {
            method: 'PUT',
            // Send the config object directly, but backend expects String @RequestBody?
            // If we send JSON object, Spring might error if mapping to String.
            // We will send it as a JSON string literal if needed, but let's try sending standard JSON first.
            // Actually, to be safe with "@RequestBody String configJson", we might need to send it as text/plain
            // OR wrap it. For now, matching Task 1 implementation which likely expects raw body.
            // We'll send the stringified JSON as the body.
            body: JSON.stringify(config),
        }),

    publish: (id: string) =>
        fetchJson<PolicySnapshot>(`/admin/policies/${id}/publish`, {
            method: 'POST',
        }),

    // Assignments
    assignPolicy: (deviceId: string, policyId: string) =>
        fetchJson<void>('/admin/policy-assignments', {
            method: 'POST',
            body: JSON.stringify({ deviceId, policyId }),
        }),

    // Status
    // We need an endpoint for this. Task 1 didn't explicitly create "list all device statuses".
    // But we have GET /api/devices in DeviceController. 
    // We can enrich it or use that.
    getDeviceStatuses: () => fetchJson<DeviceStatusSummary[]>('/devices'),
};
