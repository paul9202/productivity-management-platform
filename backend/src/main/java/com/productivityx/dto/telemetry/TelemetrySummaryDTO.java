package com.productivityx.dto.telemetry;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
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
    private String productivityTrend; // Added missing field
    private int focusScore; // Added missing, based on usage
    
    // Usage in service expects AppUsageDTO, renaming TopItemDTO or alias?
    // Let's keep TopItemDTO but add AppUsageDTO for compatibility or rename.
    // Service uses "setTopApps(List<AppUsageDTO>)"
    // DTO has "List<TopItemDTO> topApps"
    // I will rename TopItemDTO to AppUsageDTO to match Service usage.
    private List<AppUsageDTO> topApps;
    private List<AppUsageDTO> topDomains;
    private RiskCountersDTO riskCounters;
    private StatusDTO status;
    private List<InsightDTO> insights; // Added missing field

    @Data
    @Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class AppUsageDTO { // Renamed from TopItemDTO
        private String name;
        private long durationSeconds;
        private String category;
    }

    @Data
    @Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class RiskCountersDTO {
        private int blocks;
        private int sensitiveKeywords;
        private int usbEvents;
        private int anomalies;
    }

    @Data
    @Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class StatusDTO {
        private boolean online;
        private String lastSeenAt;
        private String agentVersion;
        private String policyVersion;
        private String ackStatus;
    }

    @Data
    @Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class InsightDTO {
        private String title;
        private String severity; // WARNING, INFO
        private String message;
    }
}
