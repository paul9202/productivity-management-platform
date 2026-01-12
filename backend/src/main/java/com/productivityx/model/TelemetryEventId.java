package com.productivityx.model;

import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryEventId implements Serializable {
    private String deviceId;
    private String eventId;
}
