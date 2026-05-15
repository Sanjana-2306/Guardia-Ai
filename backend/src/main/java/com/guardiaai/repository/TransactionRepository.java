package com.guardiaai.repository;

import com.guardiaai.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // --- Velocity Check ---
    long countByUserIdAndTimestampAfter(String userId, LocalDateTime since);

    // --- Geo Impossibility: most recent transaction before given timestamp ---
    Optional<Transaction> findTopByUserIdAndTimestampBeforeOrderByTimestampDesc(
            String userId, LocalDateTime before);

    // --- Threshold Anomaly: user's historical average amount ---
    @Query("SELECT AVG(t.amount) FROM Transaction t WHERE t.userId = :userId AND t.timestamp < :before")
    Double findAverageAmountByUserIdBefore(@Param("userId") String userId,
                                           @Param("before") LocalDateTime before);

    // --- Dashboard / listing ---
    List<Transaction> findTop100ByOrderByTimestampDesc();

    List<Transaction> findByFraudulentTrueOrderByTimestampDesc();

    long countByFraudulentTrue();

    @Query("SELECT AVG(t.riskScore) FROM Transaction t WHERE t.riskScore IS NOT NULL")
    Double findAverageRiskScore();

    @Query("SELECT t FROM Transaction t WHERE t.timestamp >= :since ORDER BY t.timestamp DESC")
    List<Transaction> findTransactionsSince(@Param("since") LocalDateTime since);
}
