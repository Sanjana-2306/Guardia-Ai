package com.guardiaai.controller;

import com.guardiaai.dto.DashboardStats;
import com.guardiaai.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregate statistics for the SOC dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final TransactionService transactionService;

    /**
     * Returns aggregate stats: totals, fraud rate, avg risk score,
     * and the 10 most recent risk events.
     */
    @GetMapping("/stats")
    @Operation(summary = "Get SOC dashboard aggregate statistics")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(transactionService.getDashboardStats());
    }

    /**
     * Simple ping for frontend connectivity checks.
     */
    @GetMapping("/ping")
    @Operation(summary = "Dashboard ping / connectivity check")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of(
                "status",  "online",
                "system",  "Guardia-AI SOC",
                "version", "1.0.0"
        ));
    }
}
