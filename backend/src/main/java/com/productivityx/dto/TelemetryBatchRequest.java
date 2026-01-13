package com.productivityx.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.Map;

@Data
public class TelemetryBatchRequest {
    private String eventId;
    private OffsetDateTime timestamp;
    private Integer focusScore;
    private Integer awaySeconds;
    private Integer idleSeconds;
    private String cameraState;
    private Map<String, Integer> appDurations;
}
