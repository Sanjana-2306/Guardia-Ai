package com.guardiaai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String merchantName;

    private String merchantCategory;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String ipAddress;

    @Builder.Default
    private String currency = "USD";

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Builder.Default
    private Boolean fraudulent = false;

    private Double riskScore;

    @Column(length = 500)
    private String triggeredRules;

    @Column(columnDefinition = "TEXT")
    private String aiExplanation;

    @Builder.Default
    private String status = "PENDING"; // PENDING | FLAGGED | CLEARED
}
