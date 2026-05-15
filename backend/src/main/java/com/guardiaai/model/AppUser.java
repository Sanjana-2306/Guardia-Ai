package com.guardiaai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    /** Stored as BCrypt hash — never plaintext. */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Builder.Default
    private String role = "ANALYST"; // ADMIN | ANALYST

    private String fullName;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
