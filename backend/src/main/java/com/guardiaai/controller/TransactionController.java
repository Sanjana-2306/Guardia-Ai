package com.guardiaai.controller;

import com.guardiaai.dto.TransactionRequest;
import com.guardiaai.dto.TransactionResponse;
import com.guardiaai.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Transactions", description = "Submit and query transactions through the fraud engine")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Submit a new transaction for fraud analysis.
     * Runs all 3 rules + Gemini AI + Firebase push in one call.
     */
    @PostMapping
    @Operation(summary = "Submit transaction for fraud analysis",
               description = "Runs velocity, geo-impossibility, and threshold checks + AI explanation")
    public ResponseEntity<TransactionResponse> submit(
            @Valid @RequestBody TransactionRequest request) {

        log.info("📥 Transaction received: userId={}, amount={}, merchant={}",
                request.getUserId(), request.getAmount(), request.getMerchantName());

        TransactionResponse response = transactionService.processTransaction(request);

        HttpStatus status = Boolean.TRUE.equals(response.getFraudulent()) ? HttpStatus.ACCEPTED : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(response);
    }

    /**
     * Get the 100 most recent transactions.
     */
    @GetMapping
    @Operation(summary = "Get latest 100 transactions")
    public ResponseEntity<List<TransactionResponse>> getAll() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    /**
     * Get only flagged (fraudulent) transactions.
     */
    @GetMapping("/flagged")
    @Operation(summary = "Get all flagged (fraudulent) transactions")
    public ResponseEntity<List<TransactionResponse>> getFlagged() {
        return ResponseEntity.ok(transactionService.getFlaggedTransactions());
    }
}
