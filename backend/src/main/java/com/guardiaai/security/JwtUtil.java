package com.guardiaai.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * JWT utility for token generation and validation.
 * Uses HMAC-SHA256 with a configurable secret key.
 */
@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret:GuardiaAI-Super-Secret-Key-2024-Must-Be-At-Least-256-Bits-Long!}")
    private String jwtSecret;

    @Value("${jwt.expiration.ms:86400000}")  // 24 hours
    private long jwtExpirationMs;

    // -------------------------------------------------------------------------
    // Token Generation
    // -------------------------------------------------------------------------
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // -------------------------------------------------------------------------
    // Token Validation
    // -------------------------------------------------------------------------
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT malformed: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("JWT validation error: {}", e.getMessage());
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // Claims extraction
    // -------------------------------------------------------------------------
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }

    // -------------------------------------------------------------------------
    // Signing key
    // -------------------------------------------------------------------------
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
}
