package com.productivityx.dto.telemetry;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class TimelineBucketDTO {
    private String startTime;
    private String endTime;
    private int activeSeconds;
    private int idleSeconds;
    private int lockedSeconds;
    private String topApp;
    private String topDomain;
    private Map<String, Integer> eventCounts; // block, file, im, alert
}
