package com.productivityx.service;

import com.productivityx.dto.dashboard.DashboardDataDTO;
import com.productivityx.repository.DeviceRepository;
import com.productivityx.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DeviceRepository deviceRepository;
    private final OrganizationRepository organizationRepository;

    public DashboardDataDTO getDashboardData(String range, String scopeType, String scopeId) {
        // Hybrid Implementation:
        // Real Data: Online Devices count
        // Mock Data: Productivity metrics (until aggregation engine is built)

        long totalDevices = deviceRepository.count();
        long onlineDevices = deviceRepository.countByStatus("ONLINE"); // Assuming we have this, or use findAll
        
        DashboardDataDTO.ExecutiveKPIsDTO kpis = buildKpis(totalDevices, onlineDevices);
        List<DashboardDataDTO.DepartmentStatsDTO> departments = buildDepartments();
        DashboardDataDTO.TrendsDTO trends = buildTrends();
        List<DashboardDataDTO.RiskBreakdownDTO> riskBreakdown = buildRiskBreakdown();
        List<DashboardDataDTO.TopIssueDTO> topIssues = buildTopIssues();

        return DashboardDataDTO.builder()
                .generatedAt(LocalDateTime.now().toString())
                .kpis(kpis)
                .departments(departments)
                .trends(trends)
                .riskBreakdown(riskBreakdown)
                .topIssues(topIssues)
                .build();
    }

    private DashboardDataDTO.ExecutiveKPIsDTO buildKpis(long totalDevices, long onlineDevices) {
        return DashboardDataDTO.ExecutiveKPIsDTO.builder()
                .onlineDevices(createMetric("online", "Online Devices", onlineDevices + "/" + totalDevices, "", 5, true))
                .activeMinutes(createMetric("active", "Avg Active Time", "5h 12m", "", 12, true))
                .idleRatio(createMetric("idle", "Idle Ratio", "12%", "", -2, false)) // Lower is better
                .focusIndex(createMetric("focus", "Focus Index", 78, "", 3, true))
                .productiveAppShare(createMetric("prod", "Prod. App Share", "82%", "", 1, true))
                .riskAlerts(createMetric("risk", "Risk Alerts", 3, "", -50, false))
                .policyCompliance(createMetric("compliance", "Policy Health", "98%", "", 0, true))
                .dataHealth(createMetric("health", "Data Completeness", "100%", "", 0, true))
                .build();
    }

    private DashboardDataDTO.KpiMetricDTO createMetric(String id, String label, Object value, String unit, double trendVal, boolean isGood) {
        return DashboardDataDTO.KpiMetricDTO.builder()
                .id(id)
                .label(label)
                .value(value)
                .unit(unit)
                .trend(DashboardDataDTO.KpiMetricDTO.TrendDTO.builder()
                        .value(Math.abs(trendVal))
                        .direction(trendVal > 0 ? "up" : trendVal < 0 ? "down" : "flat")
                        .isGood(isGood ? trendVal >= 0 : trendVal <= 0)
                        .label("vs yesterday")
                        .build())
                .color(isGood ? "success" : "warning") // simplistic
                .build();
    }

    private List<DashboardDataDTO.DepartmentStatsDTO> buildDepartments() {
         // Mock Depts
         return Arrays.asList(
             DashboardDataDTO.DepartmentStatsDTO.builder().id("d1").name("Engineering").userCount(12).deviceCount(15).activeMinPerUser(350).idleRatio(10).focusIndex(85).riskScore(5).onlineRate(95).topRiskType("None").trend("stable").build(),
             DashboardDataDTO.DepartmentStatsDTO.builder().id("d2").name("Sales").userCount(8).deviceCount(8).activeMinPerUser(280).idleRatio(15).focusIndex(65).riskScore(12).onlineRate(88).topRiskType("DLP").trend("improving").build(),
             DashboardDataDTO.DepartmentStatsDTO.builder().id("d3").name("Marketing").userCount(5).deviceCount(5).activeMinPerUser(310).idleRatio(20).focusIndex(70).riskScore(8).onlineRate(100).topRiskType("ShadowIT").trend("stable").build()
         );
    }

    private DashboardDataDTO.TrendsDTO buildTrends() {
        List<DashboardDataDTO.TrendPointDTO> daily = new ArrayList<>();
        // Last 7 days
        for(int i=6; i>=0; i--) {
            daily.add(DashboardDataDTO.TrendPointDTO.builder()
                .time(LocalDateTime.now().minusDays(i).toLocalDate().toString())
                .active(300 + new Random().nextInt(100))
                .idle(30 + new Random().nextInt(20))
                .risk(new Random().nextInt(10))
                .health(90 + new Random().nextInt(10))
                .build());
        }
        return DashboardDataDTO.TrendsDTO.builder().daily(daily).hourly(new ArrayList<>()).build();
    }

    private List<DashboardDataDTO.RiskBreakdownDTO> buildRiskBreakdown() {
        return Arrays.asList(
            DashboardDataDTO.RiskBreakdownDTO.builder().type("USB Storage").count(12).build(),
            DashboardDataDTO.RiskBreakdownDTO.builder().type("Unsanctioned App").count(8).build(),
            DashboardDataDTO.RiskBreakdownDTO.builder().type("Large Upload").count(3).build()
        );
    }

    private List<DashboardDataDTO.TopIssueDTO> buildTopIssues() {
        return Arrays.asList(
            DashboardDataDTO.TopIssueDTO.builder()
                .id("i1")
                .title("High Idle Rate in Sales")
                .category("PRODUCTIVITY")
                .severity("P2")
                .confidence(85)
                .impact("Sales Dept")
                .evidence("Idle > 20% for 3 days")
                .recommendation(DashboardDataDTO.TopIssueDTO.RecommendationDTO.builder()
                    .label("Investigate")
                    .action("NAVIGATE")
                    .target("/departments/d2")
                    .build())
                .build()
        );
    }
}
