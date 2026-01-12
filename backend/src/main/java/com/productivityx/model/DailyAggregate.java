package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_aggregates")
@Data
public class DailyAggregate {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "device_id")
    private String deviceId;

    private LocalDate date;

    @Column(name = "avg_focus_score")
    private Double avgFocusScore;

    @Column(name = "total_away_seconds")
    private Long totalAwaySeconds;

    @Column(name = "total_idle_seconds")
    private Long totalIdleSeconds;
}
