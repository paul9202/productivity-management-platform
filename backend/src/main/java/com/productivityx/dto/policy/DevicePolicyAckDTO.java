package com.productivityx.dto.policy;

import lombok.Data;
import java.util.UUID;

@Data
public class DevicePolicyAckDTO {
    private String deviceId;
    private UUID policyId;
    private Integer version;
    private String status;
    private String reason;
    private Long appliedAtMs;
    private String agentVersion;
    private String clientEtag;
}
