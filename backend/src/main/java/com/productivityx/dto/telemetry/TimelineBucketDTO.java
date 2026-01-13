package com.productivityx.dto.telemetry;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TimelineBucketDTO {
    private String timestamp; // Renamed from startTime/endTime to match Service usage "setTimestamp"
    // private String startTime; // Service uses timestamp
    // private String endTime; 
    
    private int activeSeconds;
    private int idleSeconds;
    private int lockedSeconds;
    private int focusScore; // Added missing field
    private String topApp;
    private String topDomain;
    private Map<String, Integer> eventCounts; // block, file, im, alert
}
