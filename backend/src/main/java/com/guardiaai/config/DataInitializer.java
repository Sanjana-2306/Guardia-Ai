package com.guardiaai.config;

import com.guardiaai.model.AppUser;
import com.guardiaai.model.Transaction;
import com.guardiaai.repository.TransactionRepository;
import com.guardiaai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the H2 in-memory database with realistic demo data on startup.
 * Only runs in "dev" profile (default) — never in production.
 *
 * Demo credentials:
 *   admin@guardia.ai   / Admin@1234    (role: ADMIN)
 *   analyst@guardia.ai / Analyst@1234  (role: ANALYST)
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository        userRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder       passwordEncoder;

    @Bean
    @Profile("!prod")   // skip in production
    public CommandLineRunner seedData() {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("📦 Database already seeded — skipping.");
                return;
            }

            log.info("🌱 Seeding demo data...");

            // ---- Users ----
            AppUser admin = userRepository.save(AppUser.builder()
                    .email("admin@guardia.ai")
                    .passwordHash(passwordEncoder.encode("Admin@1234"))
                    .role("ADMIN")
                    .createdAt(LocalDateTime.now())
                    .build());

            AppUser analyst = userRepository.save(AppUser.builder()
                    .email("analyst@guardia.ai")
                    .passwordHash(passwordEncoder.encode("Analyst@1234"))
                    .role("ANALYST")
                    .createdAt(LocalDateTime.now())
                    .build());

            log.info("✅ Created users: {}, {}", admin.getEmail(), analyst.getEmail());

            // ---- Transactions — Mixed clean + fraudulent patterns ----
            LocalDateTime now = LocalDateTime.now();

            List<Transaction> transactions = List.of(

                // --- Clean transactions ---
                Transaction.builder().userId("user-001").amount(150.00)
                    .merchantName("Amazon Prime").latitude(13.0827).longitude(80.2707)
                    .timestamp(now.minusHours(24)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-002").amount(89.99)
                    .merchantName("Swiggy").latitude(12.9716).longitude(77.5946)
                    .timestamp(now.minusHours(20)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-003").amount(2200.00)
                    .merchantName("Flipkart").latitude(28.7041).longitude(77.1025)
                    .timestamp(now.minusHours(18)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-004").amount(45.50)
                    .merchantName("Starbucks").latitude(19.0760).longitude(72.8777)
                    .timestamp(now.minusHours(15)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-005").amount(500.00)
                    .merchantName("BookMyShow").latitude(22.5726).longitude(88.3639)
                    .timestamp(now.minusHours(12)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                // --- Velocity fraud: user-101 makes 3 rapid transactions ---
                Transaction.builder().userId("user-101").amount(120.00)
                    .merchantName("Zomato").latitude(13.0827).longitude(80.2707)
                    .timestamp(now.minusSeconds(50)).fraudulent(true).riskScore(35.0).status("FLAGGED")
                    .triggeredRules("VELOCITY_CHECK").build(),

                Transaction.builder().userId("user-101").amount(130.00)
                    .merchantName("Pizza Hut").latitude(13.0830).longitude(80.2710)
                    .timestamp(now.minusSeconds(30)).fraudulent(true).riskScore(35.0).status("FLAGGED")
                    .triggeredRules("VELOCITY_CHECK").build(),

                Transaction.builder().userId("user-101").amount(140.00)
                    .merchantName("KFC").latitude(13.0835).longitude(80.2715)
                    .timestamp(now.minusSeconds(10)).fraudulent(true).riskScore(35.0).status("FLAGGED")
                    .triggeredRules("VELOCITY_CHECK").build(),

                // --- Geo impossibility: Mumbai → London in 2 minutes ---
                Transaction.builder().userId("user-202").amount(999.00)
                    .merchantName("HDFC Bank ATM").latitude(19.0760).longitude(72.8777)
                    .timestamp(now.minusMinutes(5)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-202").amount(850.00)
                    .merchantName("Barclays London").latitude(51.5074).longitude(-0.1278)
                    .timestamp(now.minusMinutes(3)).fraudulent(true).riskScore(45.0).status("FLAGGED")
                    .triggeredRules("GEO_IMPOSSIBILITY").build(),

                // --- Threshold anomaly: avg ~100, spike to 9500 ---
                Transaction.builder().userId("user-303").amount(80.00)
                    .merchantName("Reliance Digital").latitude(28.6139).longitude(77.2090)
                    .timestamp(now.minusHours(10)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-303").amount(110.00)
                    .merchantName("Croma").latitude(28.6150).longitude(77.2100)
                    .timestamp(now.minusHours(8)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-303").amount(9500.00)
                    .merchantName("Unknown Merchant").latitude(28.6200).longitude(77.2150)
                    .timestamp(now.minusHours(1)).fraudulent(true).riskScore(30.0).status("FLAGGED")
                    .triggeredRules("THRESHOLD_ANOMALY").build(),

                // --- Multi-rule: velocity + threshold ---
                Transaction.builder().userId("user-404").amount(50.00)
                    .merchantName("PayTM").latitude(17.3850).longitude(78.4867)
                    .timestamp(now.minusSeconds(55)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-404").amount(50.00)
                    .merchantName("PhonePe").latitude(17.3855).longitude(78.4870)
                    .timestamp(now.minusSeconds(40)).fraudulent(false).riskScore(0.0).status("CLEARED").build(),

                Transaction.builder().userId("user-404").amount(15000.00)
                    .merchantName("Wire Transfer Intl").latitude(17.3860).longitude(78.4875)
                    .timestamp(now.minusSeconds(20)).fraudulent(true).riskScore(65.0).status("FLAGGED")
                    .triggeredRules("VELOCITY_CHECK,THRESHOLD_ANOMALY").build()
            );

            transactionRepository.saveAll(transactions);
            log.info("✅ Seeded {} demo transactions.", transactions.size());
            log.info("🚀 Guardia-AI is ready!");
            log.info("   Swagger UI   → http://localhost:8080/swagger-ui.html");
            log.info("   H2 Console   → http://localhost:8080/h2-console");
            log.info("   Admin login  → admin@guardia.ai    / Admin@1234");
            log.info("   Analyst login → analyst@guardia.ai / Analyst@1234");
        };
    }
}
