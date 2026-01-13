package com.productivityx.controller;

import com.productivityx.model.AuditLog;
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
        if (log.getTimestamp() == null) log.setTimestamp(LocalDateTime.now());
        return auditLogRepository.save(log);
    }
}
