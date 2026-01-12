package com.productivityx.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TelemetryResponse {
    private int accepted;
    private int duplicates;
    private int rejected;
    private List<String> errors;
}
