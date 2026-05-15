package com.guardiaai.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private String userId;
    private Double amount;
    private String merchantName;
    private String merchantCategory;
    private Double latitude;
    private Double longitude;
    private String ipAddress;
    private String currency;
    private LocalDateTime timestamp;
    private Boolean fraudulent;
    private Double riskScore;
    private List<String> triggeredRules;
    private String aiExplanation;
    private String status;
}
