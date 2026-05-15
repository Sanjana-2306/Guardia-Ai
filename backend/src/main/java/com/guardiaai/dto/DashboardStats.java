package com.guardiaai.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStats {

    private long   totalTransactions;
    private long   fraudulentTransactions;
    private double fraudRate;           // percentage
    private double averageRiskScore;
    private List<RiskEventSummary> recentRiskEvents;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RiskEventSummary {
        private Long          transactionId;
        private String        userId;
        private double        riskScore;
        private List<String>  triggeredRules;
        private LocalDateTime createdAt;
    }
}
