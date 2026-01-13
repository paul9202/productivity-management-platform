package com.productivityx.dto.dashboard;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardDataDTO {
    private String generatedAt;
    private ExecutiveKPIsDTO kpis;
    private List<DepartmentStatsDTO> departments;
    private TrendsDTO trends;
    private List<RiskBreakdownDTO> riskBreakdown;
    private List<TopIssueDTO> topIssues;

    @Data
    @Builder
    public static class ExecutiveKPIsDTO {
        private KpiMetricDTO onlineDevices;
        private KpiMetricDTO activeMinutes;
        private KpiMetricDTO idleRatio;
        private KpiMetricDTO focusIndex;
        private KpiMetricDTO productiveAppShare;
        private KpiMetricDTO riskAlerts;
        private KpiMetricDTO policyCompliance;
        private KpiMetricDTO dataHealth;
    }

    @Data
    @Builder
    public static class KpiMetricDTO {
        private String id;
        private String label;
        private Object value;
        private String unit;
        private TrendDTO trend;
        private String color;
        private String drilldown;

        @Data
        @Builder
        public static class TrendDTO {
            private double value;
            private String direction; // up, down, flat
            private boolean isGood;
            private String label;
        }
    }

    @Data
    @Builder
    public static class DepartmentStatsDTO {
        private String id;
        private String name;
        private int userCount;
        private int deviceCount;
        
        private int activeMinPerUser;
        private int idleRatio;
        private int focusIndex;
        private int riskScore;
        private int onlineRate;
        
        private String topRiskType;
        private String trend; // improving, stable, degrading
    }

    @Data
    @Builder
    public static class TrendsDTO {
        private List<TrendPointDTO> daily;
        private List<TrendPointDTO> hourly;
    }

    @Data
    @Builder
    public static class TrendPointDTO {
        private String time;
        private int active;
        private int idle;
        private int risk;
        private int health;
    }

    @Data
    @Builder
    public static class RiskBreakdownDTO {
        private String type;
        private int count;
    }

    @Data
    @Builder
    public static class TopIssueDTO {
        private String id;
        private String title;
        private String category;
        private String severity;
        private int confidence;
        private String impact;
        private String evidence;
        private RecommendationDTO recommendation;

        @Data
        @Builder
        public static class RecommendationDTO {
            private String label;
            private String action;
            private String target;
        }
    }
}
