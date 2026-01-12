package com.productivityx.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "policy_settings")
@Data
public class PolicySettings {
    @Id
    private Integer id;
    private int idleThresholdMinutes;
    private int gazeAwayThresholdSeconds;
    private int offTaskThresholdMinutes;
    private List<String> exemptSchedules;
    private List<String> whitelistedApps;
    private List<String> blacklistedSites;
}
