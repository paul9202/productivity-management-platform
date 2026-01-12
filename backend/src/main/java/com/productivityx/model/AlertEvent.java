package com.productivityx.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_events")
@Data
public class AlertEvent {
    @Id
    private String id;
    private String employeeId;
    private String employeeName;
    private String type;
    private String severity;
    private LocalDateTime timestamp;
    private boolean acknowledged;
    private String details;
}
