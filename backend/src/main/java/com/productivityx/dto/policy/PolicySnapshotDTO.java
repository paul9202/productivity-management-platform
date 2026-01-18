package com.productivityx.dto.policy;

import lombok.Data;
import java.util.UUID;

@Data
public class PolicySnapshotDTO {
    private UUID policyId;
    private Integer version;
    private String snapshotJson;
    private String etag;
    private Long issuedAtMs;
    private Long expiresAtMs;
}
