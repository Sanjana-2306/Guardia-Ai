package com.guardiaai.service;

import com.guardiaai.dto.LoginResponse.BreachInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Checks user email passwords against the HaveIBeenPwned (HIBP) Pwned Passwords API
 * using k-anonymity — only the first 5 chars of the SHA-1 hash are sent to the API.
 *
 * No API key required. Privacy-preserving by design.
 */
@Service
@Slf4j
public class BreachIntelligenceService {

    private static final String HIBP_API_URL = "https://api.pwnedpasswords.com/range/";
    private final RestTemplate restTemplate  = new RestTemplate();

    /**
     * Check whether a plaintext password appears in known data breaches.
     *
     * @param password  the plaintext password to check
     * @return BreachInfo record with breach status and count
     */
    public BreachInfo checkPassword(String password) {
        if (password == null || password.isBlank()) {
            return BreachInfo.safe();
        }

        try {
            String sha1      = sha1Hex(password).toUpperCase();
            String prefix    = sha1.substring(0, 5);
            String suffix    = sha1.substring(5);

            String response  = restTemplate.getForObject(HIBP_API_URL + prefix, String.class);

            if (response == null) return BreachInfo.safe();

            // HIBP returns lines like: SUFFIX:COUNT
            for (String line : response.split("\r?\n")) {
                String[] parts = line.split(":");
                if (parts.length == 2 && parts[0].equalsIgnoreCase(suffix)) {
                    int count = Integer.parseInt(parts[1].trim());
                    log.warn("🔓 Password found in {} HIBP breaches for hash prefix {}", count, prefix);
                    return BreachInfo.breached(count);
                }
            }

            log.info("✅ Password not found in HIBP breaches (hash prefix {})", prefix);
            return BreachInfo.safe();

        } catch (HttpClientErrorException e) {
            log.error("HIBP API HTTP error: {} — {}", e.getStatusCode(), e.getMessage());
            return BreachInfo.unavailable();
        } catch (Exception e) {
            log.error("HIBP check failed: {}", e.getMessage());
            return BreachInfo.unavailable();
        }
    }

    // -------------------------------------------------------------------------
    // SHA-1 utility
    // -------------------------------------------------------------------------
    private String sha1Hex(String input) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
