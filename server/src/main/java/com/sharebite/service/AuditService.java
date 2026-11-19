package com.sharebite.service;

import com.sharebite.model.AuditEvent;
import com.sharebite.repository.AuditEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    public void logEvent(String actorId, String actorName, String actorRole,
                         String entityType, String entityId, String action, String details) {
        AuditEvent event = new AuditEvent(null, actorId, actorName, actorRole, entityType, entityId, action, details);
        auditEventRepository.save(event);
    }

    public List<AuditEvent> getRecentEvents() {
        return auditEventRepository.findTop50ByOrderByTimestampDesc();
    }

    public List<AuditEvent> getEventsForEntity(String entityId) {
        return auditEventRepository.findByEntityIdOrderByTimestampDesc(entityId);
    }
}
