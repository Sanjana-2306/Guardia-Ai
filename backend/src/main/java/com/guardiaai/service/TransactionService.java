package com.guardiaai.service;

import com.guardiaai.dto.*;
import com.guardiaai.model.RiskEvent;
import com.guardiaai.model.Transaction;
import com.guardiaai.repository.RiskEventRepository;
import com.guardiaai.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Orchestrates the full transaction processing pipeline:
 *   1. Persist the incoming transaction
 *   2. Run fraud detection rules
 *   3. Generate AI explanation (Gemini)
 *   4. Persist risk event (if fraudulent)
 *   5. Push to Firebase Realtime DB (if fraudulent)
 *   6. Return full TransactionResponse
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository  transactionRepository;
    private final RiskEventRepository    riskEventRepository;
    private final FraudDetectionService  fraudDetectionService;
    private final AiExplanationService   aiExplanationService;
    private final FirebaseEventService   firebaseEventService;

    // -------------------------------------------------------------------------
    // Submit a new transaction
    // -------------------------------------------------------------------------
    @Transactional
    public TransactionResponse processTransaction(TransactionRequest request) {
        // 1. Build and persist transaction (initial save before fraud check)
        Transaction tx = Transaction.builder()
                .userId(request.getUserId())
                .amount(request.getAmount())
                .merchantName(request.getMerchantName())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(LocalDateTime.now())
                .fraudulent(false)
                .riskScore(0.0)
                .status("PENDING")
                .build();
        tx = transactionRepository.save(tx);

        // 2. Run fraud detection
        FraudResult fraudResult = fraudDetectionService.evaluate(tx);

        // 3. Generate AI explanation
        String aiExplanation = aiExplanationService.explain(tx, fraudResult);

        // 4. Update transaction with fraud result
        tx.setFraudulent(fraudResult.isFraudulent());
        tx.setRiskScore(fraudResult.getRiskScore());
        tx.setTriggeredRules(String.join(",", fraudResult.getTriggeredRules()));
        tx.setAiExplanation(aiExplanation);
        tx.setStatus(fraudResult.isFraudulent() ? "FLAGGED" : "CLEARED");
        tx = transactionRepository.save(tx);

        // 5. Persist risk event if fraud detected
        if (fraudResult.isFraudulent()) {
            RiskEvent event = RiskEvent.builder()
                    .transactionId(tx.getId())
                    .userId(tx.getUserId())
                    .riskScore(fraudResult.getRiskScore())
                    .triggeredRules(String.join(",", fraudResult.getTriggeredRules()))
                    .aiExplanation(aiExplanation)
                    .createdAt(LocalDateTime.now())
                    .build();
            riskEventRepository.save(event);

            // 6. Push to Firebase (best-effort)
            firebaseEventService.publishRiskEvent(tx, fraudResult, aiExplanation);
        }

        log.info("Transaction {} processed — fraud={}, score={}",
                tx.getId(), fraudResult.isFraudulent(), fraudResult.getRiskScore());

        return buildResponse(tx, fraudResult, aiExplanation);
    }

    // -------------------------------------------------------------------------
    // Get all transactions (100 most recent)
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findTop100ByOrderByTimestampDesc()
                .stream()
                .map(tx -> buildResponse(tx, null, null))
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Get only flagged transactions
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<TransactionResponse> getFlaggedTransactions() {
        return transactionRepository.findByFraudulentTrueOrderByTimestampDesc()
                .stream()
                .map(tx -> buildResponse(tx, null, null))
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Dashboard aggregate stats
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        long total   = transactionRepository.count();
        long flagged = transactionRepository.countByFraudulentTrue();
        double rate  = total > 0 ? (flagged * 100.0 / total) : 0.0;
        Double avgRisk = transactionRepository.findAverageRiskScore();

        List<RiskEvent> recentEvents = riskEventRepository.findTop10ByOrderByCreatedAtDesc();

        return DashboardStats.builder()
                .totalTransactions(total)
                .fraudulentTransactions(flagged)
                .fraudRate(Math.round(rate * 100.0) / 100.0)
                .averageRiskScore(avgRisk != null ? Math.round(avgRisk * 100.0) / 100.0 : 0.0)
                .recentRiskEvents(recentEvents.stream().map(e ->
                        DashboardStats.RiskEventSummary.builder()
                                .transactionId(e.getTransactionId())
                                .userId(e.getUserId())
                                .riskScore(e.getRiskScore())
                                .triggeredRules(List.of(e.getTriggeredRules().split(",")))
                                .createdAt(e.getCreatedAt())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }

    // -------------------------------------------------------------------------
    // Build TransactionResponse from entity + results
    // -------------------------------------------------------------------------
    private TransactionResponse buildResponse(Transaction tx, FraudResult result, String explanation) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .userId(tx.getUserId())
                .amount(tx.getAmount())
                .merchantName(tx.getMerchantName())
                .latitude(tx.getLatitude())
                .longitude(tx.getLongitude())
                .timestamp(tx.getTimestamp())
                .fraudulent(tx.getFraudulent())
                .riskScore(tx.getRiskScore())
                .status(tx.getStatus())
                .triggeredRules(result != null ? result.getTriggeredRules() : List.of())
                .aiExplanation(explanation)
                .build();
    }
}
