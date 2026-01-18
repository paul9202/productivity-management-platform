package com.productivityx.dto.policy;

import lombok.Data;
import java.util.UUID;

@Data
public class PolicyPackDTO {
    private UUID id;
    private UUID tenantId;
    private UUID orgId;
    private String name;
    private String description;
    private String status;
    private Integer publishedVersion;
    private String configDraft;
    private Long createdAt;
    private Long updatedAt;
}
