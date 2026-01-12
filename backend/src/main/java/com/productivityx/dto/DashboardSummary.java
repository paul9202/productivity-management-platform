package com.productivityx.dto;

import java.util.List;

public record DashboardSummary(
    double avgFocusScore,
    double totalActiveHours,
    double offTaskRatio,
    int alertsToday,
    List<TrendPoint> trendLast7Days,
    List<AppUsage> topNonWorkApps,
    List<BlockedDomain> topBlockedDomains,
    List<DepartmentStat> departmentStats
) {}

record TrendPoint(String date, int score) {}
record AppUsage(String name, int duration) {}
record BlockedDomain(String domain, int attempts) {}
record DepartmentStat(String name, int score, int alerts) {}
