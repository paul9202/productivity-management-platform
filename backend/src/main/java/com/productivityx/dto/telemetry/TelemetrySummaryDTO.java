package com.productivityx.dto.telemetry;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class TelemetrySummaryDTO {
    private String deviceId;
    private String userId;
    private String from;
    private String to;
    private long totalActiveSeconds;
    private long totalIdleSeconds;
    private long totalLockedSeconds;
    private int productivityScore;
    private int riskScore;
    private List<TopItemDTO> topApps;
    private List<TopItemDTO> topDomains;
    private RiskCountersDTO riskCounters;
    private StatusDTO status;

    @Data
    @Builder
    public static class TopItemDTO {
        private String name;
        private long durationSeconds;
        private String category;
    }

    @Data
    @Builder
    public static class RiskCountersDTO {
        private int blocks;
        private int sensitiveKeywords;
        private int usbEvents;
        private int anomalies;
    }

    @Data
    @Builder
    public static class StatusDTO {
        private boolean online;
        private String lastSeenAt;
        private String agentVersion;
        private String policyVersion;
        private String ackStatus;
    }
}
