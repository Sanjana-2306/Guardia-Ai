package com.guardiaai.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FraudResult {

    private boolean fraudulent;
    private double riskScore;       // 0–100
    private List<String> triggeredRules;
    private String velocityDetail;
    private String geoDetail;
    private String thresholdDetail;

    public String getTriggeredRulesAsString() {
        return triggeredRules != null ? String.join(", ", triggeredRules) : "";
    }
}
