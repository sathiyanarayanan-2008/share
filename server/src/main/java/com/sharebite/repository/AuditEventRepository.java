package com.sharebite.repository;

import com.sharebite.model.AuditEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends MongoRepository<AuditEvent, String> {
    List<AuditEvent> findByEntityIdOrderByTimestampDesc(String entityId);
    List<AuditEvent> findTop50ByOrderByTimestampDesc();
}
