package com.productivityx.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PolicyResponse {
    private int focusThreshold;
    private int idleTimeoutSeconds;
    private List<String> allowedAppCategories;
    private LocalDateTime updatedAt;
}
