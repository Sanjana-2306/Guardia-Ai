package com.guardiaai.service;

import com.guardiaai.dto.FraudResult;
import com.guardiaai.model.Transaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Calls the Google Gemini API to generate a human-readable,
 * explainable AI justification for fraud decisions.
 */
@Service
@Slf4j
public class AiExplanationService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generate a plain-English explanation for why a transaction was (or wasn't) flagged.
     *
     * @param transaction  the evaluated transaction
     * @param fraudResult  the result from FraudDetectionService
     * @return AI-generated explanation string
     */
    public String explain(Transaction transaction, FraudResult fraudResult) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.warn("Gemini API key not configured — returning fallback explanation.");
            return buildFallbackExplanation(transaction, fraudResult);
        }

        try {
            String prompt = buildPrompt(transaction, fraudResult);
            String url    = geminiApiUrl + "?key=" + geminiApiKey;

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature",     0.3,
                    "maxOutputTokens", 300
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                Map.class
            );

            return extractTextFromResponse(response.getBody());

        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            return buildFallbackExplanation(transaction, fraudResult);
        }
    }

    // -------------------------------------------------------------------------
    // Build the Gemini prompt
    // -------------------------------------------------------------------------
    private String buildPrompt(Transaction transaction, FraudResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a senior fraud analyst at a bank. ");
        sb.append("Explain the following fraud detection decision in 2–3 concise sentences. ");
        sb.append("Use professional but clear language suitable for a Security Operations Center dashboard.\n\n");

        sb.append("Transaction Details:\n");
        sb.append(String.format("  User ID:     %s%n", transaction.getUserId()));
        sb.append(String.format("  Amount:      $%.2f%n", transaction.getAmount()));
        sb.append(String.format("  Merchant:    %s%n", transaction.getMerchantName()));
        sb.append(String.format("  Location:    (%.4f, %.4f)%n", transaction.getLatitude(), transaction.getLongitude()));
        sb.append(String.format("  Timestamp:   %s%n", transaction.getTimestamp()));

        if (result.isFraudulent()) {
            sb.append(String.format("%nFRAUD DETECTED — Risk Score: %.0f/100%n", result.getRiskScore()));
            sb.append("Triggered Rules:\n");
            result.getTriggeredRules().forEach(r -> sb.append("  - ").append(r).append("\n"));
            if (result.getVelocityDetail()  != null) sb.append("Velocity:  ").append(result.getVelocityDetail()).append("\n");
            if (result.getGeoDetail()       != null) sb.append("Geo:       ").append(result.getGeoDetail()).append("\n");
            if (result.getThresholdDetail() != null) sb.append("Threshold: ").append(result.getThresholdDetail()).append("\n");
            sb.append("\nExplain why this is suspicious and what the bank should do.");
        } else {
            sb.append("\nNo fraud rules triggered — transaction appears legitimate.\n");
            sb.append("Briefly confirm why this transaction is low-risk.");
        }

        return sb.toString();
    }

    // -------------------------------------------------------------------------
    // Extract the generated text from Gemini's JSON response
    // -------------------------------------------------------------------------
    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<?, ?> body) {
        try {
            List<?> candidates = (List<?>) body.get("candidates");
            Map<?, ?> first    = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content  = (Map<?, ?>) first.get("content");
            List<?> parts      = (List<?>) content.get("parts");
            Map<?, ?> part     = (Map<?, ?>) parts.get(0);
            return (String) part.get("text");
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return "AI explanation unavailable at this time.";
        }
    }

    // -------------------------------------------------------------------------
    // Fallback when Gemini key is absent — rule-based plain text
    // -------------------------------------------------------------------------
    private String buildFallbackExplanation(Transaction transaction, FraudResult result) {
        if (!result.isFraudulent()) {
            return String.format(
                "Transaction of $%.2f by user '%s' at '%s' passed all fraud checks. " +
                "No velocity anomalies, geographic impossibilities, or spending threshold " +
                "violations were detected. This transaction is considered low risk.",
                transaction.getAmount(), transaction.getUserId(), transaction.getMerchantName()
            );
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format(
            "⚠️ Fraud alert for user '%s': transaction of $%.2f at '%s' triggered %d rule(s). ",
            transaction.getUserId(), transaction.getAmount(),
            transaction.getMerchantName(), result.getTriggeredRules().size()
        ));

        if (result.getVelocityDetail()  != null) sb.append(result.getVelocityDetail()).append(" ");
        if (result.getGeoDetail()       != null) sb.append(result.getGeoDetail()).append(" ");
        if (result.getThresholdDetail() != null) sb.append(result.getThresholdDetail()).append(" ");

        sb.append(String.format("Overall risk score: %.0f/100. Recommend immediate review.", result.getRiskScore()));
        return sb.toString();
    }
}
