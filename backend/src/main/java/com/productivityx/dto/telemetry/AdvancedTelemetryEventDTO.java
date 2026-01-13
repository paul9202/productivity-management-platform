package com.productivityx.dto.telemetry;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class AdvancedTelemetryEventDTO {
    private String id;
    private String deviceId;
    private String userId;
    private String timestamp; // ISO 8601
    private String type; // APP, WEB, FILE, IM, ALERT
    private int duration; // Added missing
    private String severity; // Added missing
    private Map<String, Object> details; // Renamed from metadata to details based on Service usage
    
    // Alias metadata to details if needed, but Service uses setDetails
}
