package com.guardiaai.service;

import com.guardiaai.dto.FraudResult;
import com.guardiaai.model.Transaction;
import com.guardiaai.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Core fraud detection engine implementing three rule-based checks:
 * 1. Velocity Check   — >3 transactions in 60 seconds per user
 * 2. Geo Impossibility — travel speed >800 km/h between transactions
 * 3. Threshold Anomaly — amount >400% of historical average
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FraudDetectionService {

    private static final int    VELOCITY_WINDOW_SECONDS = 60;
    private static final int    VELOCITY_THRESHOLD      = 3;
    private static final double GEO_SPEED_LIMIT_KMH    = 800.0;
    private static final double THRESHOLD_MULTIPLIER    = 4.0; // 400%

    private final TransactionRepository transactionRepository;

    /**
     * Evaluate a transaction against all fraud rules and return a composite result.
     */
    public FraudResult evaluate(Transaction transaction) {
        List<String> triggeredRules = new ArrayList<>();
        double riskScore = 0.0;
        String velocityDetail = null, geoDetail = null, thresholdDetail = null;

        // --- Rule 1: Velocity Check ---
        FraudCheckOutcome velocity = checkVelocity(transaction);
        if (velocity.flagged()) {
            triggeredRules.add("VELOCITY_CHECK");
            riskScore += 35.0;
            velocityDetail = velocity.detail();
            log.warn("🚨 VELOCITY_CHECK triggered for user {} — {}", transaction.getUserId(), velocity.detail());
        }

        // --- Rule 2: Geographical Impossibility ---
        FraudCheckOutcome geo = checkGeoImpossibility(transaction);
        if (geo.flagged()) {
            triggeredRules.add("GEO_IMPOSSIBILITY");
            riskScore += 45.0;
            geoDetail = geo.detail();
            log.warn("🚨 GEO_IMPOSSIBILITY triggered for user {} — {}", transaction.getUserId(), geo.detail());
        }

        // --- Rule 3: Threshold Anomaly ---
        FraudCheckOutcome threshold = checkThresholdAnomaly(transaction);
        if (threshold.flagged()) {
            triggeredRules.add("THRESHOLD_ANOMALY");
            riskScore += 30.0;
            thresholdDetail = threshold.detail();
            log.warn("🚨 THRESHOLD_ANOMALY triggered for user {} — {}", transaction.getUserId(), threshold.detail());
        }

        // Cap at 100
        riskScore = Math.min(riskScore, 100.0);

        return FraudResult.builder()
                .fraudulent(!triggeredRules.isEmpty())
                .riskScore(riskScore)
                .triggeredRules(triggeredRules)
                .velocityDetail(velocityDetail)
                .geoDetail(geoDetail)
                .thresholdDetail(thresholdDetail)
                .build();
    }

    // -------------------------------------------------------------------------
    // Rule 1: Velocity Check
    // -------------------------------------------------------------------------
    private FraudCheckOutcome checkVelocity(Transaction tx) {
        LocalDateTime windowStart = tx.getTimestamp().minusSeconds(VELOCITY_WINDOW_SECONDS);
        long count = transactionRepository.countByUserIdAndTimestampAfter(tx.getUserId(), windowStart);

        if (count >= VELOCITY_THRESHOLD) {
            return FraudCheckOutcome.flagged(
                    String.format("User '%s' made %d transactions in the last %ds (threshold: %d).",
                            tx.getUserId(), count, VELOCITY_WINDOW_SECONDS, VELOCITY_THRESHOLD));
        }
        return FraudCheckOutcome.safe();
    }

    // -------------------------------------------------------------------------
    // Rule 2: Geographical Impossibility  (Haversine formula)
    // -------------------------------------------------------------------------
    private FraudCheckOutcome checkGeoImpossibility(Transaction tx) {
        Optional<Transaction> prevOpt = transactionRepository
                .findTopByUserIdAndTimestampBeforeOrderByTimestampDesc(tx.getUserId(), tx.getTimestamp());

        if (prevOpt.isEmpty()) return FraudCheckOutcome.safe();

        Transaction prev = prevOpt.get();
        double distanceKm = haversineDistance(
                prev.getLatitude(), prev.getLongitude(),
                tx.getLatitude(), tx.getLongitude());

        long seconds = ChronoUnit.SECONDS.between(prev.getTimestamp(), tx.getTimestamp());
        if (seconds <= 0) return FraudCheckOutcome.safe();

        double speedKmh = (distanceKm / seconds) * 3600.0;

        if (speedKmh > GEO_SPEED_LIMIT_KMH) {
            return FraudCheckOutcome.flagged(
                    String.format("Implied travel speed of %.0f km/h between transactions " +
                                  "(%.0f km in %ds). Exceeds limit of %.0f km/h.",
                            speedKmh, distanceKm, seconds, GEO_SPEED_LIMIT_KMH));
        }
        return FraudCheckOutcome.safe();
    }

    // -------------------------------------------------------------------------
    // Rule 3: Threshold Anomaly
    // -------------------------------------------------------------------------
    private FraudCheckOutcome checkThresholdAnomaly(Transaction tx) {
        Double avg = transactionRepository.findAverageAmountByUserIdBefore(tx.getUserId(), tx.getTimestamp());

        if (avg == null || avg == 0.0) return FraudCheckOutcome.safe(); // no history

        double ratio = tx.getAmount() / avg;
        if (ratio > THRESHOLD_MULTIPLIER) {
            return FraudCheckOutcome.flagged(
                    String.format("Transaction amount $%.2f is %.1fx the user's historical average of $%.2f " +
                                  "(threshold: %.0fx).",
                            tx.getAmount(), ratio, avg, THRESHOLD_MULTIPLIER));
        }
        return FraudCheckOutcome.safe();
    }

    // -------------------------------------------------------------------------
    // Haversine distance in km
    // -------------------------------------------------------------------------
    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // -------------------------------------------------------------------------
    // Internal value object for rule outcomes
    // -------------------------------------------------------------------------
    private record FraudCheckOutcome(boolean flagged, String detail) {
        static FraudCheckOutcome flagged(String detail) { return new FraudCheckOutcome(true, detail); }
        static FraudCheckOutcome safe()                 { return new FraudCheckOutcome(false, null); }
    }
}
