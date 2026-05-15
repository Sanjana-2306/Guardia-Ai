package com.guardiaai.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.guardiaai.model.Transaction;
import com.guardiaai.dto.FraudResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Publishes real-time fraud alerts to Firebase Realtime Database.
 * Gracefully no-ops if Firebase is not configured.
 */
@Service
@Slf4j
public class FirebaseEventService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Push a risk event to Firebase under /risk-events/{transactionId}.
     * Only called when a transaction is flagged as fraudulent.
     */
    public void publishRiskEvent(Transaction transaction, FraudResult fraudResult, String aiExplanation) {
        if (!isFirebaseInitialized()) {
            log.warn("Firebase not initialized — skipping real-time event push for tx {}", transaction.getId());
            return;
        }

        try {
            DatabaseReference ref = FirebaseDatabase.getInstance()
                    .getReference("risk-events")
                    .child(String.valueOf(transaction.getId()));

            Map<String, Object> event = buildEventPayload(transaction, fraudResult, aiExplanation);

            ref.setValueAsync(event).get(); // blocking for simplicity in demo; use async callback in prod
            log.info("🔥 Firebase risk event published for tx {} (score: {})",
                    transaction.getId(), fraudResult.getRiskScore());

        } catch (Exception e) {
            log.error("Failed to publish Firebase event for tx {}: {}", transaction.getId(), e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Build the payload map for Firebase
    // -------------------------------------------------------------------------
    private Map<String, Object> buildEventPayload(Transaction tx, FraudResult result, String explanation) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("transactionId",   tx.getId());
        payload.put("userId",          tx.getUserId());
        payload.put("amount",          tx.getAmount());
        payload.put("merchantName",    tx.getMerchantName());
        payload.put("riskScore",       result.getRiskScore());
        payload.put("triggeredRules",  result.getTriggeredRules());
        payload.put("aiExplanation",   explanation);
        payload.put("timestamp",       tx.getTimestamp().format(FMT));
        payload.put("latitude",        tx.getLatitude());
        payload.put("longitude",       tx.getLongitude());
        return payload;
    }

    // -------------------------------------------------------------------------
    // Safe guard: check Firebase is initialized before calling SDK
    // -------------------------------------------------------------------------
    private boolean isFirebaseInitialized() {
        try {
            return !FirebaseApp.getApps().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }
}
