package com.productivityx.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TelemetryResponse {
    private int accepted;
    private int duplicates;
    private int rejected;
    private List<String> errors;

    // Legacy support constructor
    public TelemetryResponse(boolean success, String message) {
        if (success) {
            this.accepted = 1; 
        } else {
            this.rejected = 1;
            this.errors = java.util.Collections.singletonList(message);
        }
    }
}
