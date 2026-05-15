package com.guardiaai.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${guardia.firebase.database-url}")
    private String databaseUrl;

    @Value("${guardia.firebase.credentials-path:firebase-service-account.json}")
    private String credentialsPath;

    @Bean
    public FirebaseApp firebaseApp() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }
        try {
            InputStream serviceAccount = loadCredentials();
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl(databaseUrl)
                    .build();
            log.info("✅ Firebase initialized — database: {}", databaseUrl);
            return FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            log.warn("⚠️  Firebase credentials not found at '{}'. " +
                     "Real-time event publishing disabled. " +
                     "Place firebase-service-account.json in src/main/resources to enable.", credentialsPath);
            return null;
        }
    }

    private InputStream loadCredentials() throws IOException {
        // 1. Try classpath (src/main/resources)
        InputStream stream = getClass().getClassLoader().getResourceAsStream(credentialsPath);
        if (stream != null) return stream;
        // 2. Try absolute file path
        return new FileInputStream(credentialsPath);
    }
}
