package com.guardiaai.repository;

import com.guardiaai.model.RiskEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskEventRepository extends JpaRepository<RiskEvent, Long> {

    /** Most recent 10 risk events for the dashboard feed. */
    List<RiskEvent> findTop10ByOrderByCreatedAtDesc();

    /** All risk events for a specific user. */
    List<RiskEvent> findByUserIdOrderByCreatedAtDesc(String userId);
}
