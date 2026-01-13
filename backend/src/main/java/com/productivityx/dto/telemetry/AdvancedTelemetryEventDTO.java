package com.productivityx.dto.telemetry;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class AdvancedTelemetryEventDTO {
    private String id;
    private String deviceId;
    private String userId;
    private String timestamp; // ISO 8601
    private String type; // APP, WEB, FILE, IM, ALERT
    private Map<String, Object> metadata;
}
