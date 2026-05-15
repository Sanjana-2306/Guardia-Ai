package com.guardiaai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_events")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RiskEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to the flagged Transaction — stored as plain ID for simplicity. */
    @Column(nullable = false)
    private Long transactionId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Double riskScore;

    /** Comma-separated list, e.g. "VELOCITY_CHECK,GEO_IMPOSSIBILITY" */
    @Column(nullable = false)
    private String triggeredRules;

    @Column(columnDefinition = "TEXT")
    private String aiExplanation;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
