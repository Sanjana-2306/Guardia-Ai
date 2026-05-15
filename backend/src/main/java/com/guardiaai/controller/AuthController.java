package com.guardiaai.controller;

import com.guardiaai.dto.LoginRequest;
import com.guardiaai.dto.LoginResponse;
import com.guardiaai.model.AppUser;
import com.guardiaai.repository.UserRepository;
import com.guardiaai.security.JwtUtil;
import com.guardiaai.service.BreachIntelligenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "JWT login + breach intelligence endpoints")
public class AuthController {

    private final AuthenticationManager    authenticationManager;
    private final JwtUtil                  jwtUtil;
    private final UserRepository           userRepository;
    private final BreachIntelligenceService breachService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT + breach status")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            // 1. Authenticate credentials
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            // 2. Generate JWT
            String token = jwtUtil.generateToken(request.getEmail());

            // 3. Fetch user role from DB
            AppUser user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            // 4. HIBP breach check (async-like; runs in same thread for demo)
            LoginResponse.BreachInfo breachInfo = breachService.checkPassword(request.getPassword());

            log.info("✅ Login successful for {} | breach={}", request.getEmail(), breachInfo.isBreached());

            return ResponseEntity.ok(LoginResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .role(user.getRole())
                    .breachInfo(breachInfo)
                    .build());

        } catch (BadCredentialsException e) {
            log.warn("❌ Login failed for email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Invalid email or password"));
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Auth service health check")
    public ResponseEntity<java.util.Map<String, String>> health() {
        return ResponseEntity.ok(java.util.Map.of(
                "status",  "UP",
                "service", "Guardia-AI Auth"
        ));
    }
}
