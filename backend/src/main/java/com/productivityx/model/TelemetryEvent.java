package com.productivityx.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_events")
@IdClass(TelemetryEventId.class)
@Data
public class TelemetryEvent {

    @Id
    @Column(name = "device_id")
    private String deviceId;

    @Id
    @Column(name = "event_id")
    private String eventId;

    private LocalDateTime timestamp;
    
    @Column(name = "focus_score")
    private Integer focusScore;
    
    @Column(name = "away_seconds")
    private Integer awaySeconds;
    
    @Column(name = "idle_seconds")
    private Integer idleSeconds;

    // Simplified for MVP, JSONB handling would need a custom Type or converter
    // or we just store it as string for now if not querying inside JSON
    @Column(columnDefinition = "jsonb")
    private String data; 
}
