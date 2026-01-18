package com.productivityx.controller;

import com.productivityx.model.policy.AuditLog;
import com.productivityx.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public List<AuditLog> listLogs() {
        return auditLogRepository.findAll();
    }

    @PostMapping
    public AuditLog createLog(@RequestBody AuditLog log) {
        if (log.getId() == null) log.setId(UUID.randomUUID());
        if (log.getTsMs() == null) log.setTsMs(System.currentTimeMillis());
        // Default Tenant/Org for basic audit logs if missing (not ideal but fixes compilation/runtime for MVP)
        if (log.getTenantId() == null) log.setTenantId(UUID.fromString("00000000-0000-0000-0000-000000000000"));
        if (log.getOrgId() == null) log.setOrgId(UUID.fromString("00000000-0000-0000-0000-000000000000"));
        return auditLogRepository.save(log);
    }
}
